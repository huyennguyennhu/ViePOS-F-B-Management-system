import { DashboardShell } from '@/components/layout/dashboard-shell';
import { requireModuleAccess } from '@/lib/auth/require-session';

export default async function OrdersPage() {
  const user = await requireModuleAccess('orders');

  return (
    <DashboardShell user={user}>
      <p>Theo dõi đơn hàng và trạng thái thanh toán tại quầy.</p>
    </DashboardShell>
  );
}
