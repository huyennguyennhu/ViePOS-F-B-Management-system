import { DashboardShell } from '@/components/layout/dashboard-shell';
import { requireModuleAccess } from '@/lib/auth/require-session';

export default async function SettingsPage() {
  const user = await requireModuleAccess('settings');

  return (
    <DashboardShell user={user}>
      <p>Cấu hình cửa hàng, phiên đăng nhập và thiết lập hệ thống.</p>
    </DashboardShell>
  );
}
