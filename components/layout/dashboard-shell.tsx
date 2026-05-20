import Link from 'next/link';
import {
  ClipboardList,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Store,
  Users,
} from 'lucide-react';
import { getVisibleDashboardModules, type DashboardModule } from '@/lib/auth/permissions';
import type { AppUserProfilePolicy } from '@/lib/auth/auth-roles';
import { LogoutButton } from './logout-button';
import '@/app/dashboard.css';

const MODULE_COPY: Record<DashboardModule, { label: string; href: string; icon: React.ReactNode }> = {
  sales: { label: 'Bán hàng', href: '/dashboard/sales', icon: <ShoppingCart aria-hidden="true" /> },
  orders: { label: 'Đơn hàng', href: '/dashboard/orders', icon: <ClipboardList aria-hidden="true" /> },
  menu: { label: 'Menu', href: '/dashboard/menu', icon: <Store aria-hidden="true" /> },
  staff: { label: 'Nhân viên', href: '/dashboard/staff', icon: <Users aria-hidden="true" /> },
  'staff-approvals': {
    label: 'Duyệt tài khoản',
    href: '/dashboard/staff/approvals',
    icon: <ShieldCheck aria-hidden="true" />,
  },
  'staff-roles': {
    label: 'Phân quyền',
    href: '/dashboard/staff/roles',
    icon: <ShieldCheck aria-hidden="true" />,
  },
  settings: { label: 'Cài đặt', href: '/dashboard/settings', icon: <Settings aria-hidden="true" /> },
};

interface DashboardShellProps {
  user: AppUserProfilePolicy & { name: string };
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const modules = getVisibleDashboardModules(user);

  return (
    <main className="dashboard-page">
      <section className="dashboard-card">
        <div className="dashboard-shell-header">
          <div>
            <p className="dashboard-kicker">ViePOS Dashboard</p>
            <h1>Xin chào, {user.name}</h1>
          </div>
          <LogoutButton />
        </div>

        <nav className="dashboard-nav" aria-label="Dashboard modules">
          <Link href="/dashboard">
            <LayoutDashboard aria-hidden="true" />
            Tổng quan
          </Link>
          {modules.map((module) => (
            <Link href={MODULE_COPY[module].href} key={module}>
              {MODULE_COPY[module].icon}
              {MODULE_COPY[module].label}
            </Link>
          ))}
        </nav>

        {children}
      </section>
    </main>
  );
}
