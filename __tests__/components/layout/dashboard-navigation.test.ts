import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { getDashboardNavigationItems } from '@/components/layout/dashboard-navigation-items';

const activeStaff = { role: 'STAFF' as const, status: 'ACTIVE' as const };
const activeAdmin = { role: 'ADMIN' as const, status: 'ACTIVE' as const };
const activeRoot = { role: 'ROOT_ADMIN' as const, status: 'ACTIVE' as const };

const hrefsFor = (user: typeof activeStaff | typeof activeAdmin | typeof activeRoot): string[] =>
  getDashboardNavigationItems(user).flatMap((item) => [
    item.href,
    ...(item.children?.map((child) => child.href) ?? []),
  ]);

describe('dashboard navigation items', () => {
  it('shows staff only the overview and cashier modules', () => {
    expect(hrefsFor(activeStaff)).toEqual(['/dashboard', '/dashboard/sales', '/dashboard/orders']);
  });

  it('shows admins operational modules without staff role management', () => {
    expect(hrefsFor(activeAdmin)).toEqual([
      '/dashboard',
      '/dashboard/sales',
      '/dashboard/orders',
      '/dashboard/menu',
      '/dashboard/staff',
      '/dashboard/staff/approvals',
      '/dashboard/settings',
    ]);
  });

  it('shows root admins every dashboard module route', () => {
    expect(hrefsFor(activeRoot)).toEqual([
      '/dashboard',
      '/dashboard/sales',
      '/dashboard/orders',
      '/dashboard/menu',
      '/dashboard/staff',
      '/dashboard/staff/approvals',
      '/dashboard/staff/roles',
      '/dashboard/settings',
    ]);
  });

  it('keeps UI copy out of permissions policy', () => {
    const permissionsSource = readFileSync(path.join(process.cwd(), 'lib/auth/permissions.ts'), 'utf8');

    expect(permissionsSource).not.toContain('Bán hàng');
    expect(permissionsSource).not.toContain('/dashboard/sales');
  });
});
