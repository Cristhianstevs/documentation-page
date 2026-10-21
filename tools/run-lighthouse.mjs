import { spawn } from 'node:child_process';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { chromium } from '@playwright/test';
import { withLocalServer } from './baseline-utils.mjs';

const outputDirectory = path.resolve('test-results');
const readerMode = process.argv.includes('--reader');
const outputFile = path.join(
  outputDirectory,
  readerMode ? 'lighthouse-reader.json' : 'lighthouse-baseline.json',
);

await mkdir(outputDirectory, { recursive: true });

await withLocalServer(
  async (origin) => {
    const npmExecutable = process.env.npm_execpath;
    if (!npmExecutable) throw new Error('Execute este medidor por meio do npm.');

    const arguments_ = [
      npmExecutable,
      'exec',
      '--yes',
      '--package=lighthouse@13.5.0',
      '--',
      'lighthouse',
      readerMode ? `${origin}/guias/exemplos-praticos/` : `${origin}/#guias/exemplos-praticos`,
      '--quiet',
      '--output=json',
      `--output-path=${outputFile}`,
      `--chrome-path=${chromium.executablePath()}`,
      '--only-categories=performance,accessibility,best-practices,seo',
      '--preset=perf',
      '--form-factor=mobile',
      '--screenEmulation.mobile=true',
      '--throttling-method=simulate',
    ];

    await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, arguments_, { stdio: 'inherit' });
      child.once('error', reject);
      child.once('exit', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Lighthouse encerrou com o código ${code}.`));
      });
    });
  },
  readerMode ? { port: 4182, root: 'apps/reader/out' } : undefined,
);

const report = JSON.parse(await readFile(outputFile, 'utf8'));
const scores = Object.fromEntries(
  Object.entries(report.categories).map(([id, category]) => [id, Math.round(category.score * 100)]),
);

console.log(
  JSON.stringify(
    {
      lighthouseVersion: report.lighthouseVersion,
      fetchTime: report.fetchTime,
      scores,
      metrics: {
        firstContentfulPaintMs: report.audits['first-contentful-paint'].numericValue,
        largestContentfulPaintMs: report.audits['largest-contentful-paint'].numericValue,
        totalBlockingTimeMs: report.audits['total-blocking-time'].numericValue,
        cumulativeLayoutShift: report.audits['cumulative-layout-shift'].numericValue,
        speedIndexMs: report.audits['speed-index'].numericValue,
      },
      report: path.relative(process.cwd(), outputFile),
    },
    null,
    2,
  ),
);
