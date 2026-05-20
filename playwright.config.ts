import { defineConfig, devices } from '@playwright/test';
import { E2E_AUTH_SECRET, E2E_BASE_URL, E2E_DATABASE_URL, E2E_PORT } from './e2e/e2e-env';

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: E2E_BASE_URL,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: [
      `DATABASE_URL='${E2E_DATABASE_URL}'`,
      `BETTER_AUTH_SECRET='${E2E_AUTH_SECRET}'`,
      `BETTER_AUTH_URL='${E2E_BASE_URL}'`,
      `pnpm exec next dev -p ${E2E_PORT}`,
    ].join(' '),
    reuseExistingServer: !process.env.CI,
    url: E2E_BASE_URL,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
