import { describe, expect, it, vi } from 'vitest';
import { ROOT_ADMIN_EMAIL } from '@/lib/auth/auth-roles';
import { registerStaffAccount } from '@/server/auth/register-user';

const validInput = {
  email: 'staff@viepos.test',
  name: 'Nguyen Thu Ngan',
  password: 'password123',
};

const createRepository = () => ({
  findByEmail: vi.fn(),
  createStaffAccount: vi.fn(),
});

describe('registerStaffAccount', () => {
  it('creates public registrations as pending staff only', async () => {
    const repository = createRepository();
    repository.findByEmail.mockResolvedValue(null);
    repository.createStaffAccount.mockResolvedValue({
      id: 'user-1',
      email: validInput.email,
      role: 'STAFF',
      status: 'PENDING',
    });

    const result = await registerStaffAccount(validInput, { repository });

    expect(result.ok).toBe(true);
    expect(repository.createStaffAccount).toHaveBeenCalledWith({
      email: validInput.email,
      name: validInput.name,
      password: validInput.password,
      role: 'STAFF',
      status: 'PENDING',
    });
  });

  it('rejects the reserved root email from public registration', async () => {
    const repository = createRepository();

    const result = await registerStaffAccount(
      { ...validInput, email: ` ${ROOT_ADMIN_EMAIL.toUpperCase()} ` },
      { repository }
    );

    expect(result.ok).toBe(false);
    expect(repository.createStaffAccount).not.toHaveBeenCalled();
  });

  it('rejects duplicate email registration with a generic error', async () => {
    const repository = createRepository();
    repository.findByEmail.mockResolvedValue({ id: 'existing-user' });

    const result = await registerStaffAccount(validInput, { repository });

    expect(result.ok).toBe(false);
    expect(result.message).toBe('Không thể tạo tài khoản với thông tin này.');
  });

  it('returns a generic duplicate response when the database unique constraint wins a race', async () => {
    const repository = createRepository();
    repository.findByEmail.mockResolvedValue(null);
    repository.createStaffAccount.mockRejectedValue({ code: 'P2002' });

    const result = await registerStaffAccount(validInput, { repository });

    expect(result.ok).toBe(false);
    expect(result.message).toBe('Không thể tạo tài khoản với thông tin này.');
  });
});
