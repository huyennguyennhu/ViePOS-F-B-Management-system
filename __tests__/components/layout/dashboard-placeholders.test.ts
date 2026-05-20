import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const readProjectFile = (filePath: string): string =>
  readFileSync(path.join(process.cwd(), filePath), 'utf8');

describe('dashboard route placeholders', () => {
  it('uses a shared placeholder component for shell-only module routes', () => {
    const component = readProjectFile('components/layout/dashboard-module-placeholder.tsx');
    const routeFiles = [
      'app/dashboard/page.tsx',
      'app/dashboard/sales/page.tsx',
      'app/dashboard/orders/page.tsx',
      'app/dashboard/menu/page.tsx',
      'app/dashboard/staff/page.tsx',
      'app/dashboard/settings/page.tsx',
    ];

    expect(component).toContain('DashboardModulePlaceholder');
    expect(routeFiles.every((filePath) => readProjectFile(filePath).includes('DashboardModulePlaceholder'))).toBe(
      true
    );
  });

  it('keeps staff administration server actions in place', () => {
    const approvalsPage = readProjectFile('app/dashboard/staff/approvals/page.tsx');
    const rolesPage = readProjectFile('app/dashboard/staff/roles/page.tsx');

    expect(approvalsPage).toContain("'use server'");
    expect(approvalsPage).toContain('approveStaffAccount');
    expect(rolesPage).toContain("'use server'");
    expect(rolesPage).toContain('updateUserRole');
    expect(rolesPage).toContain('disableUserAccount');
  });

  it('seeds e2e authentication deterministically through Playwright setup', () => {
    const config = readProjectFile('playwright.config.ts');
    const packageJson = readProjectFile('package.json');
    const env = readProjectFile('e2e/e2e-env.ts');
    const globalSetup = readProjectFile('e2e/global-setup.ts');
    const spec = readProjectFile('e2e/dashboard-shell.spec.ts');

    expect(config).toContain("globalSetup: './e2e/global-setup.ts'");
    expect(packageJson).toContain('E2E_DATABASE_URL=');
    expect(env).toContain('requireEnv');
    expect(env).not.toContain("process.env.DATABASE_URL ??");
    expect(env).not.toContain("?? 'password123'");
    expect(env).toContain('assertSafeDatabaseUrl');
    expect(globalSetup).toContain('db:seed-root');
    expect(spec).toContain('E2E_ROOT_EMAIL');
    expect(spec).toContain('E2E_ROOT_PASSWORD');
  });
});
