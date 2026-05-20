import { describe, expect, it } from 'vitest';
import {
  canAccessDashboard,
  canAccessModule,
  getVisibleDashboardModules,
} from '@/lib/auth/permissions';

describe('dashboard permissions', () => {
  it('allows active staff to sales and orders only', () => {
    const user = { role: 'STAFF' as const, status: 'ACTIVE' as const };

    expect(canAccessDashboard(user)).toBe(true);
    expect(getVisibleDashboardModules(user)).toEqual(['sales', 'orders']);
    expect(canAccessModule(user, 'staff')).toBe(false);
  });

  it('allows admins to operations modules but not role management', () => {
    const user = { role: 'ADMIN' as const, status: 'ACTIVE' as const };

    expect(getVisibleDashboardModules(user)).toEqual([
      'sales',
      'orders',
      'menu',
      'staff',
      'staff-approvals',
      'settings',
    ]);
    expect(canAccessModule(user, 'staff-roles')).toBe(false);
  });

  it('allows root to every module', () => {
    const user = { role: 'ROOT_ADMIN' as const, status: 'ACTIVE' as const };

    expect(getVisibleDashboardModules(user)).toContain('staff-roles');
    expect(canAccessModule(user, 'settings')).toBe(true);
  });

  it('denies pending and disabled dashboard access', () => {
    expect(canAccessDashboard({ role: 'STAFF', status: 'PENDING' })).toBe(false);
    expect(canAccessDashboard({ role: 'ADMIN', status: 'DISABLED' })).toBe(false);
  });
});
