import { revalidatePath } from 'next/cache';
import { prisma } from '@/server/db/client';
import { approveStaffAccount } from '@/server/auth/user-admin-service';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { requireActiveUser, requireModuleAccess } from '@/lib/auth/require-session';

async function approveAction(formData: FormData) {
  'use server';

  const actor = await requireActiveUser();
  const targetId = String(formData.get('targetId') ?? '');

  await approveStaffAccount(actor.id, targetId);
  revalidatePath('/dashboard/staff/approvals');
}

export default async function StaffApprovalsPage() {
  const user = await requireModuleAccess('staff-approvals');
  const pendingStaff = await prisma.appUserProfile.findMany({
    where: { role: 'STAFF', status: 'PENDING' },
    include: { user: true },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <DashboardShell user={user}>
      <p>Tài khoản nhân viên đang chờ duyệt.</p>
      <div className="dashboard-grid">
        {pendingStaff.map((profile) => (
          <article key={profile.id}>
            <strong>{profile.user.name}</strong>
            <span>{profile.user.email}</span>
            <form action={approveAction} className="dashboard-action-form">
              <input name="targetId" type="hidden" value={profile.userId} />
              <button type="submit">Duyệt</button>
            </form>
          </article>
        ))}
      </div>
    </DashboardShell>
  );
}
