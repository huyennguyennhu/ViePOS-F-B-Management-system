import { DashboardShell } from '@/components/layout/dashboard-shell';
import { requireModuleAccess } from '@/lib/auth/require-session';

export default async function SalesPage() {
  const user = await requireModuleAccess('sales');

  return (
    <DashboardShell user={user}>
      <p>Màn hình bán hàng sẽ nối với menu, giỏ hàng và thanh toán.</p>
    </DashboardShell>
  );
}
