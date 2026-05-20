import { describe, expect, it } from 'vitest';
import { validateLogin } from '@/lib/auth/demo-auth';

describe('validateLogin', () => {
  it('creates a manager session for valid email and password', () => {
    const result = validateLogin({
      email: 'manager@test.com',
      secret: 'password123',
      role: 'manager',
      rememberDevice: false,
    });

    expect(result.ok).toBe(true);
    expect(result.session?.role).toBe('manager');
  });

  it('creates a staff session for valid email and PIN', () => {
    const result = validateLogin({
      email: 'staff@test.com',
      secret: '123456',
      role: 'staff',
      rememberDevice: true,
    });

    expect(result.ok).toBe(true);
    expect(result.session?.rememberedDevice).toBe(true);
  });

  it('rejects a credential for the wrong role', () => {
    const result = validateLogin({
      email: 'manager@test.com',
      secret: '123456',
      role: 'staff',
      rememberDevice: false,
    });

    expect(result.ok).toBe(false);
  });
});
