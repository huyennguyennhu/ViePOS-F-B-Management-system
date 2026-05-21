import { useLocation } from 'react-router-dom';
import './DashboardPage.css';

const featureNames: Record<string, string> = {
  '/dashboard/overview': 'Tổng quan',
  '/dashboard/reports/revenue': 'Báo cáo Doanh thu',
  '/dashboard': 'Báo cáo Sản phẩm',
  '/dashboard/reports/products': 'Báo cáo Sản phẩm',
  '/dashboard/reports/staff': 'Báo cáo Nhân viên',
  '/dashboard/orders': 'Đơn hàng',
  '/dashboard/products/categories': 'Danh mục sản phẩm',
  '/dashboard/products/list': 'Danh sách sản phẩm',
  '/dashboard/inventory/manage': 'Quản lý tồn kho',
  '/dashboard/inventory/history': 'Lịch sử biến động',
  '/dashboard/staff': 'Quản lý Nhân viên',
  '/dashboard/tables': 'Quản lý Bàn',
  '/dashboard/promotions': 'Khuyến mãi',
  '/dashboard/settings': 'Thiết lập',
};

export default function DashboardPage() {
  const location = useLocation();
  const featureName = featureNames[location.pathname] || 'Tính năng này';

  return (
    <div className="report-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <h2 style={{ color: '#256E05', marginBottom: '16px', fontSize: '1.8rem' }}>Tính năng {featureName}</h2>
        <p style={{ color: '#666', fontSize: '1.2rem' }}>Đang trong quá trình phát triển nhé 🚀</p>
      </div>
    </div>
  );
}
