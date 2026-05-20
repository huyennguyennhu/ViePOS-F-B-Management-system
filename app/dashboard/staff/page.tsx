import { DashboardShell } from '@/components/layout/dashboard-shell';
import { requireModuleAccess } from '@/lib/auth/require-session';

export default async function StaffPage() {
  const user = await requireModuleAccess('staff');

  return (
    <DashboardShell user={user}>
      <p>Danh sách nhân viên và trạng thái tài khoản.</p>
    </DashboardShell>
  );
}
