import { describe, expect, it } from 'vitest';
import { shouldBlockDirectBetterAuthRoute } from '@/server/auth/better-auth-route-policy';

describe('Better Auth route policy', () => {
  it('blocks direct email signup and signin endpoints', () => {
    expect(shouldBlockDirectBetterAuthRoute(new Request('http://localhost/api/auth/sign-up/email'))).toBe(
      true
    );
    expect(shouldBlockDirectBetterAuthRoute(new Request('http://localhost/api/auth/sign-in/email'))).toBe(
      true
    );
  });

  it('allows non-credential Better Auth endpoints to pass through', () => {
    expect(shouldBlockDirectBetterAuthRoute(new Request('http://localhost/api/auth/get-session'))).toBe(
      false
    );
  });
});
