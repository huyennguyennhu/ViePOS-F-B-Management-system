const requireEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} must be set for dashboard e2e runs.`);
  }

  return value;
};

const assertSafeDatabaseUrl = (databaseUrl: string): string => {
  const url = new URL(databaseUrl);
  const localHosts = new Set(['localhost', '127.0.0.1', '::1']);
  const allowNonLocalDatabase = process.env.E2E_ALLOW_NON_LOCAL_DATABASE === 'true';

  if (!allowNonLocalDatabase && !localHosts.has(url.hostname)) {
    throw new Error('E2E_DATABASE_URL must point to localhost unless E2E_ALLOW_NON_LOCAL_DATABASE=true.');
  }

  if (!/viepos|e2e|test/i.test(url.pathname)) {
    throw new Error('E2E_DATABASE_URL database name must include viepos, e2e, or test.');
  }

  return databaseUrl;
};

export const E2E_PORT = Number(process.env.E2E_PORT ?? 3010);
export const E2E_BASE_URL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${E2E_PORT}`;
export const E2E_DATABASE_URL = assertSafeDatabaseUrl(requireEnv('E2E_DATABASE_URL'));
export const E2E_AUTH_SECRET = requireEnv('E2E_AUTH_SECRET');
export const E2E_ROOT_EMAIL = requireEnv('E2E_ROOT_EMAIL');
export const E2E_ROOT_PASSWORD = requireEnv('E2E_ROOT_PASSWORD');
export const E2E_ROOT_NAME = process.env.E2E_ROOT_NAME ?? 'ViePOS Root Admin';
