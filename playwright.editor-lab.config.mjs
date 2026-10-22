import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/editor-browser',
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-editor-report' }]],
  use: {
    baseURL: 'http://127.0.0.1:4175',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'node tools/serve.mjs --port 4175 --root apps/editor-lab/out',
    url: 'http://127.0.0.1:4175',
    reuseExistingServer: !process.env.CI,
  },
  projects: [{ name: 'editor-desktop', use: { ...devices['Desktop Chrome'] } }],
});
