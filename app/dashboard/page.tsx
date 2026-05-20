import { DashboardShell } from '@/components/layout/dashboard-shell';
import { requireActiveUser } from '@/lib/auth/require-session';
import { getVisibleDashboardModules } from '@/lib/auth/permissions';

export default async function DashboardPage() {
  const user = await requireActiveUser();
  const modules = getVisibleDashboardModules(user);

  return (
    <DashboardShell user={user}>
      <p>
        Tài khoản đang hoạt động với vai trò {user.role}. Các module bên dưới được lọc theo quyền
        truy cập máy chủ.
      </p>
      <div className="dashboard-grid">
        {modules.map((module) => (
          <article key={module}>
            <strong>{module}</strong>
            <span>Sẵn sàng cho thao tác trong phạm vi quyền hiện tại.</span>
          </article>
        ))}
      </div>
    </DashboardShell>
  );
}
