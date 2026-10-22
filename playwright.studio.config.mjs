import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

const siteRoot = path.resolve('test-results/studio-site');

export default defineConfig({
  testDir: './tests/studio-browser',
  workers: 1,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-studio-report' }]],
  use: {
    baseURL: 'http://127.0.0.1:4176',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'node tools/prepare-studio-test.mjs && npm run studio:dev',
    env: { DOCUMENTATION_SITE_ROOT: siteRoot },
    url: 'http://127.0.0.1:4176',
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    { name: 'studio-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'studio-mobile', use: { ...devices['Pixel 5'] } },
  ],
});
