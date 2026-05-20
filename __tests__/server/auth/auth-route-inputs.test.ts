import { describe, expect, it } from 'vitest';
import { parseLoginRequestBody } from '@/server/auth/login-request';
import { parseRegisterRequestBody } from '@/server/auth/register-request';

describe('auth route input parsing', () => {
  it('rejects malformed login JSON without throwing', async () => {
    const request = new Request('http://localhost/api/app-auth/login', {
      method: 'POST',
      body: '{',
    });

    const result = await parseLoginRequestBody(request);

    expect(result.ok).toBe(false);
  });

  it('rejects untyped login body values', async () => {
    const request = new Request('http://localhost/api/app-auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 123, password: false }),
    });

    const result = await parseLoginRequestBody(request);

    expect(result.ok).toBe(false);
  });

  it('rejects malformed register JSON without throwing', async () => {
    const request = new Request('http://localhost/api/app-auth/register', {
      method: 'POST',
      body: '{',
    });

    const result = await parseRegisterRequestBody(request);

    expect(result.ok).toBe(false);
  });
});
