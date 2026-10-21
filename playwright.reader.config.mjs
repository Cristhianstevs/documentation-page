import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/reader-browser',
  fullyParallel: false,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-reader-report' }]],
  use: {
    baseURL: 'http://127.0.0.1:4174',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run reader:serve',
    url: 'http://127.0.0.1:4174',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'reader-desktop', use: { ...devices['Desktop Chrome'], colorScheme: 'dark' } },
    { name: 'reader-mobile', use: { ...devices['Pixel 5'], colorScheme: 'dark' } },
  ],
});
