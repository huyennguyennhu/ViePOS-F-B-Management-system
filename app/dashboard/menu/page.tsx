import { DashboardShell } from '@/components/layout/dashboard-shell';
import { requireModuleAccess } from '@/lib/auth/require-session';

export default async function MenuPage() {
  const user = await requireModuleAccess('menu');

  return (
    <DashboardShell user={user}>
      <p>Quản lý danh mục món, giá bán và trạng thái hiển thị.</p>
    </DashboardShell>
  );
}
