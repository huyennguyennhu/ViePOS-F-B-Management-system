import { execFileSync } from 'node:child_process';
import {
  E2E_AUTH_SECRET,
  E2E_BASE_URL,
  E2E_DATABASE_URL,
  E2E_ROOT_EMAIL,
  E2E_ROOT_NAME,
  E2E_ROOT_PASSWORD,
} from './e2e-env';

export default async function globalSetup() {
  if (E2E_ROOT_PASSWORD.length < 8) {
    throw new Error('E2E_ROOT_PASSWORD must be at least 8 characters for dashboard e2e setup.');
  }

  execFileSync('pnpm', ['db:seed-root'], {
    env: {
      ...process.env,
      DATABASE_URL: E2E_DATABASE_URL,
      BETTER_AUTH_SECRET: E2E_AUTH_SECRET,
      BETTER_AUTH_URL: E2E_BASE_URL,
      ROOT_ADMIN_EMAIL: E2E_ROOT_EMAIL,
      ROOT_ADMIN_PASSWORD: E2E_ROOT_PASSWORD,
      ROOT_ADMIN_NAME: E2E_ROOT_NAME,
      ROOT_ADMIN_RESET_PASSWORD: 'true',
    },
    stdio: 'inherit',
  });
}
