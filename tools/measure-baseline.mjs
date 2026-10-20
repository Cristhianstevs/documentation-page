import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium, devices } from '@playwright/test';
import { median, withLocalServer } from './baseline-utils.mjs';

const runs = 5;
const outputPath = path.resolve('test-results', 'baseline-metrics.json');

const result = await withLocalServer(async (baseURL) => {
  const browser = await chromium.launch({ headless: true });
  const samples = [];
  try {
    for (let index = 0; index < runs; index += 1) {
      const context = await browser.newContext(devices['Pixel 5']);
      const page = await context.newPage();
      await page.route(/fonts\.(googleapis|gstatic)\.com/, (request) => request.abort());
      await page.route('**/site/config.js', (request) =>
        request.fulfill({ status: 404, body: 'Instalação local ausente.' }),
      );
      await page.addInitScript(() => {
        globalThis.__baselineLcp = 0;
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          globalThis.__baselineLcp = entries.at(-1)?.startTime ?? globalThis.__baselineLcp;
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      });

      const startedAt = performance.now();
      await page.goto(`${baseURL}/#guias/exemplos-praticos`, { waitUntil: 'load' });
      await page.locator('h1').waitFor();
      await page.waitForTimeout(300);
      const wallTime = performance.now() - startedAt;
      const browserMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const resources = performance.getEntriesByType('resource');
        const scripts = resources.filter(
          (entry) =>
            entry.initiatorType === 'script' || new URL(entry.name).pathname.endsWith('.js'),
        );
        const total = (entries, property) =>
          entries.reduce((sum, entry) => sum + (entry[property] || 0), 0);
        return {
          domContentLoadedMs: navigation.domContentLoadedEventEnd,
          loadMs: navigation.loadEventEnd,
          lcpMs: globalThis.__baselineLcp || null,
          resourceCount: resources.length,
          transferredBytes: total(resources, 'transferSize'),
          decodedBytes: total(resources, 'decodedBodySize'),
          scriptTransferredBytes: total(scripts, 'transferSize'),
          scriptDecodedBytes: total(scripts, 'decodedBodySize'),
          usedJsHeapBytes: performance.memory?.usedJSHeapSize ?? null,
        };
      });
      samples.push({ run: index + 1, wallTimeMs: wallTime, ...browserMetrics });
      await context.close();
    }
  } finally {
    await browser.close();
  }

  const numericKeys = Object.keys(samples[0]).filter(
    (key) => key !== 'run' && samples.every((sample) => typeof sample[key] === 'number'),
  );
  return {
    measuredAt: new Date().toISOString(),
    environment: {
      browser: 'Chromium do Playwright',
      profile: 'Pixel 5',
      network: 'servidor local sem limitação artificial',
      fonts: 'requisições externas bloqueadas',
      route: '#guias/exemplos-praticos',
      runs,
    },
    median: Object.fromEntries(
      numericKeys.map((key) => [key, Math.round(median(samples.map((sample) => sample[key])))]),
    ),
    samples,
  };
});

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(result, null, 2));
console.log(`Resultado bruto gravado em ${path.relative(process.cwd(), outputPath)}.`);
