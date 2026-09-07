import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://127.0.0.1:1420' },
  webServer: { command: 'npm run dev -- --host 127.0.0.1', url: 'http://127.0.0.1:1420', reuseExistingServer: !process.env.CI },
  projects: [
    { name: 'small-phone', use: { viewport: { width: 320, height: 740 } } },
    { name: 'phone', use: { viewport: { width: 390, height: 844 } } },
    { name: 'tablet', use: { viewport: { width: 1024, height: 768 } } },
  ],
});
