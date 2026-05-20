import { describe, expect, it } from 'vitest';
import { validateAccountRegistration } from '@/lib/auth/account-registration';

const validInput = {
  email: 'owner@viepos.test',
  fullName: 'Nguyễn Minh Anh',
  password: 'password123',
  confirmPassword: 'password123',
  acceptedTerms: true,
};

describe('validateAccountRegistration', () => {
  it('creates a pending staff account for valid input', () => {
    const result = validateAccountRegistration(validInput);

    expect(result.ok).toBe(true);
    expect(result.account?.email).toBe('owner@viepos.test');
    expect(result.account?.displayName).toBe('Nguyễn Minh Anh');
    expect(result.account?.role).toBe('STAFF');
    expect(result.account?.status).toBe('PENDING');
  });

  it('rejects mismatched password confirmation', () => {
    const result = validateAccountRegistration({
      ...validInput,
      confirmPassword: 'password456',
    });

    expect(result.ok).toBe(false);
  });

  it('rejects account creation without accepted terms', () => {
    const result = validateAccountRegistration({
      ...validInput,
      acceptedTerms: false,
    });

    expect(result.ok).toBe(false);
  });
});
