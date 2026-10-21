import { spawn } from 'node:child_process';
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { chromium, devices } from '@playwright/test';
import { median } from './baseline-utils.mjs';

const outputDirectory = path.resolve('apps/reader/out');
const reportPath = path.resolve('test-results/reader-metrics.json');
const port = 4181;
const origin = `http://127.0.0.1:${port}`;
const runs = 5;
const scriptGzipBudgetBytes = 180 * 1024;

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) => {
        const target = path.join(directory, entry.name);
        return entry.isDirectory() ? listFiles(target) : [target];
      }),
    )
  ).flat();
}

await stat(path.join(outputDirectory, 'index.html')).catch(() => {
  throw new Error('Execute npm run reader:build antes de medir o leitor.');
});

const files = await listFiles(outputDirectory);
const scriptFiles = files.filter((file) => file.endsWith('.js'));
let scriptBytes = 0;
let scriptGzipBytes = 0;
for (const file of scriptFiles) {
  const content = await readFile(file);
  scriptBytes += content.byteLength;
  scriptGzipBytes += gzipSync(content).byteLength;
}

const server = spawn(
  process.execPath,
  ['tools/serve.mjs', '--port', String(port), '--root', 'apps/reader/out'],
  { cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'] },
);

try {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    try {
      if ((await fetch(origin)).ok) break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  const browser = await chromium.launch({ headless: true });
  const samples = [];
  try {
    for (let run = 1; run <= runs; run += 1) {
      const context = await browser.newContext({ ...devices['Pixel 5'], colorScheme: 'dark' });
      const page = await context.newPage();
      await page.addInitScript(() => {
        globalThis.__readerLcp = 0;
        new PerformanceObserver((list) => {
          globalThis.__readerLcp = list.getEntries().at(-1)?.startTime ?? globalThis.__readerLcp;
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      });
      await page.goto(`${origin}/guias/exemplos-praticos/`, { waitUntil: 'load' });
      await page.locator('h1').waitFor();
      await page.waitForTimeout(300);
      samples.push(
        await page.evaluate((sampleRun) => {
          const navigation = performance.getEntriesByType('navigation')[0];
          const resources = performance.getEntriesByType('resource');
          const scripts = resources.filter((entry) => entry.initiatorType === 'script');
          const total = (entries, property) =>
            entries.reduce((sum, entry) => sum + (entry[property] || 0), 0);
          return {
            run: sampleRun,
            domContentLoadedMs: navigation.domContentLoadedEventEnd,
            loadMs: navigation.loadEventEnd,
            lcpMs: globalThis.__readerLcp || null,
            resourceCount: resources.length,
            transferredBytes: total(resources, 'transferSize'),
            scriptTransferredBytes: total(scripts, 'transferSize'),
            usedJsHeapBytes: performance.memory?.usedJSHeapSize ?? null,
          };
        }, run),
      );
      await context.close();
    }
  } finally {
    await browser.close();
  }

  const numericKeys = Object.keys(samples[0]).filter(
    (key) => key !== 'run' && samples.every((sample) => typeof sample[key] === 'number'),
  );
  const result = {
    measuredAt: new Date().toISOString(),
    environment: { browser: 'Chromium do Playwright', profile: 'Pixel 5', runs },
    bundle: {
      budgetPassed: scriptGzipBytes <= scriptGzipBudgetBytes,
      scriptBytes,
      scriptFiles: scriptFiles.length,
      scriptGzipBudgetBytes,
      scriptGzipBytes,
    },
    median: Object.fromEntries(
      numericKeys.map((key) => [key, Math.round(median(samples.map((sample) => sample[key])))]),
    ),
    samples,
  };
  await mkdir(path.dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(result, null, 2));
  if (!result.bundle.budgetPassed) {
    throw new Error(
      `O JavaScript compactado (${scriptGzipBytes} bytes) excedeu o orçamento (${scriptGzipBudgetBytes} bytes).`,
    );
  }
} finally {
  server.kill('SIGTERM');
}
