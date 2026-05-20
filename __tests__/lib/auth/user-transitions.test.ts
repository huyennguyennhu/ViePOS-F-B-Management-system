import { describe, expect, it } from 'vitest';
import {
  assertCanApproveAccount,
  assertCanDisableAccount,
  assertCanUpdateRole,
  assertMutableTarget,
} from '@/lib/auth/user-transitions';
import type { AppUserProfilePolicy } from '@/lib/auth/auth-roles';

const activeRoot: AppUserProfilePolicy = {
  email: 'nguyennlt.ncc@gmail.com',
  role: 'ROOT_ADMIN',
  status: 'ACTIVE',
};
const activeAdmin: AppUserProfilePolicy = {
  email: 'admin@viepos.test',
  role: 'ADMIN',
  status: 'ACTIVE',
};
const activeStaff: AppUserProfilePolicy = {
  email: 'staff@viepos.test',
  role: 'STAFF',
  status: 'ACTIVE',
};
const pendingStaff: AppUserProfilePolicy = {
  email: 'pending@viepos.test',
  role: 'STAFF',
  status: 'PENDING',
};
const disabledStaff: AppUserProfilePolicy = {
  email: 'disabled@viepos.test',
  role: 'STAFF',
  status: 'DISABLED',
};

describe('user transition policy', () => {
  it('allows root and admin to approve pending staff', () => {
    expect(assertCanApproveAccount(activeRoot, pendingStaff).ok).toBe(true);
    expect(assertCanApproveAccount(activeAdmin, pendingStaff).ok).toBe(true);
    expect(assertCanApproveAccount(activeStaff, pendingStaff).ok).toBe(false);
  });

  it('allows only root to promote or demote admin and staff targets', () => {
    expect(assertCanUpdateRole(activeRoot, activeStaff, 'ADMIN').ok).toBe(true);
    expect(assertCanUpdateRole(activeRoot, activeAdmin, 'STAFF').ok).toBe(true);
    expect(assertCanUpdateRole(activeAdmin, activeStaff, 'ADMIN').ok).toBe(false);
    expect(assertCanUpdateRole(activeRoot, activeStaff, 'ROOT_ADMIN').ok).toBe(false);
  });

  it('requires role update targets to be active accounts', () => {
    expect(assertCanUpdateRole(activeRoot, pendingStaff, 'ADMIN').ok).toBe(false);
    expect(assertCanUpdateRole(activeRoot, disabledStaff, 'ADMIN').ok).toBe(false);
  });

  it('enforces the disable matrix', () => {
    expect(assertCanDisableAccount(activeRoot, activeAdmin).ok).toBe(true);
    expect(assertCanDisableAccount(activeRoot, activeStaff).ok).toBe(true);
    expect(assertCanDisableAccount(activeAdmin, activeStaff).ok).toBe(true);
    expect(assertCanDisableAccount(activeAdmin, activeRoot).ok).toBe(false);
    expect(assertCanDisableAccount(activeStaff, activeAdmin).ok).toBe(false);
  });

  it('keeps root target immutable across mutation paths', () => {
    expect(assertMutableTarget(activeRoot).ok).toBe(false);
    expect(assertCanUpdateRole(activeRoot, activeRoot, 'ADMIN').ok).toBe(false);
    expect(assertCanDisableAccount(activeRoot, activeRoot).ok).toBe(false);
  });
});
