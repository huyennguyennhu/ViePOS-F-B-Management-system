import { describe, expect, it, vi } from 'vitest';
import {
  approveStaffAccount,
  disableUserAccount,
  updateUserRole,
} from '@/server/auth/user-admin-service';

const root = {
  id: 'root-id',
  email: 'nguyennlt.ncc@gmail.com',
  role: 'ROOT_ADMIN' as const,
  status: 'ACTIVE' as const,
};
const admin = {
  id: 'admin-id',
  email: 'admin@viepos.test',
  role: 'ADMIN' as const,
  status: 'ACTIVE' as const,
};
const staff = {
  id: 'staff-id',
  email: 'staff@viepos.test',
  role: 'STAFF' as const,
  status: 'ACTIVE' as const,
};
const pendingStaff = {
  id: 'pending-id',
  email: 'pending@viepos.test',
  role: 'STAFF' as const,
  status: 'PENDING' as const,
};

const createRepository = () => ({
  findProfileByUserId: vi.fn(),
  updateProfile: vi.fn().mockResolvedValue(true),
});

describe('user admin service', () => {
  it('approves pending staff for admin actors', async () => {
    const repository = createRepository();
    repository.findProfileByUserId.mockResolvedValueOnce(admin).mockResolvedValueOnce(pendingStaff);

    const result = await approveStaffAccount(admin.id, pendingStaff.id, { repository });

    expect(result.ok).toBe(true);
    expect(repository.updateProfile).toHaveBeenCalledWith(
      pendingStaff.id,
      { status: 'ACTIVE' },
      { role: 'STAFF', status: 'PENDING' }
    );
  });

  it('allows root to update admin and staff roles without creating another root', async () => {
    const repository = createRepository();
    repository.findProfileByUserId.mockResolvedValueOnce(root).mockResolvedValueOnce(staff);

    const result = await updateUserRole(root.id, staff.id, 'ADMIN', { repository });

    expect(result.ok).toBe(true);
    expect(repository.updateProfile).toHaveBeenCalledWith(
      staff.id,
      { role: 'ADMIN' },
      { role: 'STAFF', status: 'ACTIVE' }
    );
  });

  it('uses expected target state for atomic role updates', async () => {
    const repository = createRepository();
    repository.findProfileByUserId.mockResolvedValueOnce(root).mockResolvedValueOnce(staff);

    await updateUserRole(root.id, staff.id, 'ADMIN', { repository });

    expect(repository.updateProfile).toHaveBeenCalledWith(
      staff.id,
      { role: 'ADMIN' },
      { role: 'STAFF', status: 'ACTIVE' }
    );
  });

  it('blocks admin role updates', async () => {
    const repository = createRepository();
    repository.findProfileByUserId.mockResolvedValueOnce(admin).mockResolvedValueOnce(staff);

    const result = await updateUserRole(admin.id, staff.id, 'ADMIN', { repository });

    expect(result.ok).toBe(false);
    expect(repository.updateProfile).not.toHaveBeenCalled();
  });

  it('blocks role updates for pending staff accounts', async () => {
    const repository = createRepository();
    repository.findProfileByUserId.mockResolvedValueOnce(root).mockResolvedValueOnce(pendingStaff);

    const result = await updateUserRole(root.id, pendingStaff.id, 'ADMIN', { repository });

    expect(result.ok).toBe(false);
    expect(repository.updateProfile).not.toHaveBeenCalled();
  });

  it('enforces disable matrix through the service', async () => {
    const repository = createRepository();
    repository.findProfileByUserId.mockResolvedValueOnce(admin).mockResolvedValueOnce(staff);

    const result = await disableUserAccount(admin.id, staff.id, { repository });

    expect(result.ok).toBe(true);
    expect(repository.updateProfile).toHaveBeenCalledWith(
      staff.id,
      { status: 'DISABLED' },
      { role: 'STAFF', status: 'ACTIVE' }
    );
  });
});
