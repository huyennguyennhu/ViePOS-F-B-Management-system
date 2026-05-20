import { describe, expect, it } from 'vitest';
import {
  ROOT_ADMIN_EMAIL,
  getInitialRoleForPublicSignup,
  getInitialStatusForPublicSignup,
  isRootAdmin,
  normalizeEmail,
} from '@/lib/auth/auth-roles';

describe('auth role helpers', () => {
  it('normalizes emails before policy checks', () => {
    expect(normalizeEmail('  NGUYENNLT.NCC@GMAIL.COM  ')).toBe(ROOT_ADMIN_EMAIL);
  });

  it('starts every public signup as pending staff', () => {
    expect(getInitialRoleForPublicSignup()).toBe('STAFF');
    expect(getInitialStatusForPublicSignup()).toBe('PENDING');
  });

  it('requires both reserved email and root role for root admin identity', () => {
    expect(isRootAdmin({ email: ROOT_ADMIN_EMAIL, role: 'ROOT_ADMIN' })).toBe(true);
    expect(isRootAdmin({ email: ROOT_ADMIN_EMAIL, role: 'ADMIN' })).toBe(false);
    expect(isRootAdmin({ email: 'admin@viepos.test', role: 'ROOT_ADMIN' })).toBe(false);
  });
});
