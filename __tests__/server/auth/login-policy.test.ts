import { describe, expect, it } from 'vitest';
import {
  AUTH_RATE_LIMITS,
  canCreateSessionForUser,
  createFixedWindowRateLimiter,
  getPostLoginRedirect,
} from '@/server/auth/login-policy';

describe('login policy', () => {
  it('allows active users for every role and sends them to dashboard', () => {
    for (const role of ['ROOT_ADMIN', 'ADMIN', 'STAFF'] as const) {
      expect(canCreateSessionForUser({ role, status: 'ACTIVE' })).toEqual({ ok: true });
      expect(getPostLoginRedirect({ role, status: 'ACTIVE' })).toBe('/dashboard');
    }
  });

  it('blocks pending and disabled users before dashboard access', () => {
    expect(canCreateSessionForUser({ role: 'STAFF', status: 'PENDING' }).ok).toBe(false);
    expect(canCreateSessionForUser({ role: 'ADMIN', status: 'DISABLED' }).ok).toBe(false);
  });

  it('limits failed logins after five attempts per email and IP in ten minutes', () => {
    const limiter = createFixedWindowRateLimiter(AUTH_RATE_LIMITS.login);
    const key = 'staff@viepos.test:127.0.0.1';

    for (let attempt = 1; attempt <= 5; attempt += 1) {
      expect(limiter.consume(key, 0).allowed).toBe(true);
    }

    expect(limiter.consume(key, 0).allowed).toBe(false);
  });

  it('limits registrations after three attempts per IP in one hour', () => {
    const limiter = createFixedWindowRateLimiter(AUTH_RATE_LIMITS.register);

    expect(limiter.consume('127.0.0.1', 0).allowed).toBe(true);
    expect(limiter.consume('127.0.0.1', 0).allowed).toBe(true);
    expect(limiter.consume('127.0.0.1', 0).allowed).toBe(true);
    expect(limiter.consume('127.0.0.1', 0).allowed).toBe(false);
  });
});
