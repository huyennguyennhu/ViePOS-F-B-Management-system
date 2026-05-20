import { describe, expect, it, vi } from 'vitest';
import { ROOT_ADMIN_EMAIL } from '@/lib/auth/auth-roles';
import { seedRootAdmin } from '@/server/db/root-seed';

const baseEnv = {
  ROOT_ADMIN_EMAIL,
  ROOT_ADMIN_PASSWORD: 'super-secret-password',
  ROOT_ADMIN_NAME: 'ViePOS Root',
};

const createPrisma = () => ({
  user: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
  account: {
    upsert: vi.fn(),
  },
  appUserProfile: {
    upsert: vi.fn(),
  },
});

describe('seedRootAdmin', () => {
  it('upserts the reserved root user and forces root active profile', async () => {
    const prisma = createPrisma();
    prisma.user.upsert.mockResolvedValue({ id: 'root-user-id', email: ROOT_ADMIN_EMAIL });

    await seedRootAdmin({ prisma, env: baseEnv });

    expect(prisma.user.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: ROOT_ADMIN_EMAIL },
        update: expect.objectContaining({
          email: ROOT_ADMIN_EMAIL,
          name: 'ViePOS Root',
        }),
        create: expect.objectContaining({
          email: ROOT_ADMIN_EMAIL,
          name: 'ViePOS Root',
        }),
      })
    );
    expect(prisma.appUserProfile.upsert).toHaveBeenCalledWith({
      where: { userId: 'root-user-id' },
      update: { role: 'ROOT_ADMIN', status: 'ACTIVE' },
      create: { userId: 'root-user-id', role: 'ROOT_ADMIN', status: 'ACTIVE' },
    });
  });

  it('rejects a preclaimed reserved email that is not already active root', async () => {
    const prisma = createPrisma();
    prisma.user.findUnique.mockResolvedValue({
      id: 'preclaimed-user-id',
      email: ROOT_ADMIN_EMAIL,
      appProfile: { role: 'STAFF', status: 'PENDING' },
    });

    await expect(seedRootAdmin({ prisma, env: baseEnv })).rejects.toThrow(
      'Reserved root email already exists outside root seed control.'
    );
    expect(prisma.user.upsert).not.toHaveBeenCalled();
  });

  it('allows explicit reset for a preclaimed reserved email', async () => {
    const prisma = createPrisma();
    prisma.user.findUnique.mockResolvedValue({
      id: 'preclaimed-user-id',
      email: ROOT_ADMIN_EMAIL,
      appProfile: { role: 'STAFF', status: 'PENDING' },
    });
    prisma.user.upsert.mockResolvedValue({ id: 'preclaimed-user-id', email: ROOT_ADMIN_EMAIL });

    await seedRootAdmin({
      prisma,
      env: { ...baseEnv, ROOT_ADMIN_RESET_PASSWORD: 'true' },
    });

    expect(prisma.user.upsert).toHaveBeenCalled();
    expect(prisma.account.upsert).toHaveBeenCalled();
  });

  it('allows explicit trust for an existing reserved email password', async () => {
    const prisma = createPrisma();
    prisma.user.findUnique.mockResolvedValue({
      id: 'preclaimed-user-id',
      email: ROOT_ADMIN_EMAIL,
      appProfile: { role: 'STAFF', status: 'PENDING' },
    });
    prisma.user.upsert.mockResolvedValue({ id: 'preclaimed-user-id', email: ROOT_ADMIN_EMAIL });

    await seedRootAdmin({
      prisma,
      env: { ...baseEnv, ROOT_ADMIN_TRUST_EXISTING_PASSWORD: 'true' },
    });

    expect(prisma.user.upsert).toHaveBeenCalled();
  });

  it('does not overwrite an existing root password unless explicitly requested', async () => {
    const prisma = createPrisma();
    prisma.user.upsert.mockResolvedValue({ id: 'root-user-id', email: ROOT_ADMIN_EMAIL });

    await seedRootAdmin({ prisma, env: baseEnv });

    expect(prisma.user.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.not.objectContaining({
          password: expect.any(String),
        }),
      })
    );
  });
});
