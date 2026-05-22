import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BarChart2, ShoppingCart, Package, Users, Coffee, Tag, Settings, ChevronRight, ChevronDown, ChevronLeft } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ isSidebarOpen = true, toggleSidebar }: { isSidebarOpen?: boolean, toggleSidebar?: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [reportsExpanded, setReportsExpanded] = useState(true);
  const [productsExpanded, setProductsExpanded] = useState(false);
  const [inventoryExpanded, setInventoryExpanded] = useState(false);
  const [staffExpanded, setStaffExpanded] = useState(false);

  const isActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const isReportsActive = isActive('/dashboard/reports') || isActive('/dashboard', true);
  const isProductsActive = isActive('/dashboard/products');
  const isInventoryActive = isActive('/dashboard/inventory');
  const isStaffActive = isActive('/dashboard/staff');

  const navigateTo = (path: string, section?: 'reports' | 'products' | 'inventory' | 'staff') => {
    navigate(path);
    if (!isSidebarOpen && toggleSidebar) {
      // Don't auto-open sidebar when navigating from tooltip
    }
    if (section) {
      if (section !== 'reports') setReportsExpanded(false);
      if (section !== 'products') setProductsExpanded(false);
      if (section !== 'inventory') setInventoryExpanded(false);
      if (section !== 'staff') setStaffExpanded(false);
    } else {
      setReportsExpanded(false);
      setProductsExpanded(false);
      setInventoryExpanded(false);
      setStaffExpanded(false);
    }
  };

  const toggleMenu = (e: React.MouseEvent, setFunc: any, expanded: boolean) => {
    e.stopPropagation();
    if (isSidebarOpen) {
      setFunc(!expanded);
    }
  };

  return (
    <div className={`sidebar ${!isSidebarOpen ? 'collapsed' : ''}`}>
      {toggleSidebar && (
        <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
          {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      )}

      <div className="sidebar-nav">
        
        <div className="nav-group">
          <div className={`nav-item ${isActive('/dashboard/overview') ? 'active' : ''}`} onClick={() => navigateTo('/dashboard/overview')}>
            <div className="nav-item-left"><Home size={18} /> <span className="nav-label">Tổng quan</span></div>
          </div>
        </div>

        <div className="nav-group">
          <div className={`nav-item ${isReportsActive ? 'active' : ''}`} onClick={(e) => toggleMenu(e, setReportsExpanded, reportsExpanded)}>
            <div className="nav-item-left"><BarChart2 size={18} /> <span className="nav-label">Báo cáo</span></div>
            {(reportsExpanded && isSidebarOpen) ? <ChevronDown size={16} className="nav-chevron" /> : <ChevronRight size={16} className="nav-chevron" />}
          </div>
          
          {(reportsExpanded || !isSidebarOpen) && (
            <div className="nav-sub-menu">
              <div className="nav-sub-title">Báo cáo</div>
              <div className={`sub-nav-item ${isActive('/dashboard/reports/revenue') ? 'active' : ''}`} onClick={() => navigateTo('/dashboard/reports/revenue', 'reports')}>
                {isActive('/dashboard/reports/revenue') && <span className="sub-nav-indicator">●</span>}
                <span>Doanh thu</span>
              </div>
              <div className={`sub-nav-item ${isActive('/dashboard', true) || isActive('/dashboard/reports/products') ? 'active' : ''}`} onClick={() => navigateTo('/dashboard', 'reports')}>
                {(isActive('/dashboard', true) || isActive('/dashboard/reports/products')) && <span className="sub-nav-indicator">●</span>}
                <span>Sản phẩm</span>
              </div>
              <div className={`sub-nav-item ${isActive('/dashboard/reports/staff') ? 'active' : ''}`} onClick={() => navigateTo('/dashboard/reports/staff', 'reports')}>
                {isActive('/dashboard/reports/staff') && <span className="sub-nav-indicator">●</span>}
                <span>Nhân viên</span>
              </div>
            </div>
          )}
        </div>

        <div className="nav-group">
          <div className={`nav-item ${isActive('/dashboard/orders') ? 'active' : ''}`} onClick={() => navigateTo('/dashboard/orders')}>
            <div className="nav-item-left"><ShoppingCart size={18} /> <span className="nav-label">Đơn hàng</span></div>
          </div>
        </div>

        <div className="nav-group">
          <div className={`nav-item ${isProductsActive ? 'active' : ''}`} onClick={(e) => toggleMenu(e, setProductsExpanded, productsExpanded)}>
            <div className="nav-item-left"><Package size={18} /> <span className="nav-label">Sản phẩm</span></div>
            {(productsExpanded && isSidebarOpen) ? <ChevronDown size={16} className="nav-chevron" /> : <ChevronRight size={16} className="nav-chevron" />}
          </div>
          
          {(productsExpanded || !isSidebarOpen) && (
            <div className="nav-sub-menu">
              <div className="nav-sub-title">Sản phẩm</div>
              <div className={`sub-nav-item ${isActive('/dashboard/products/categories') ? 'active' : ''}`} onClick={() => navigateTo('/dashboard/products/categories', 'products')}>
                {isActive('/dashboard/products/categories') && <span className="sub-nav-indicator">●</span>}
                <span>Danh mục</span>
              </div>
              <div className={`sub-nav-item ${isActive('/dashboard/products/list') ? 'active' : ''}`} onClick={() => navigateTo('/dashboard/products/list', 'products')}>
                {isActive('/dashboard/products/list') && <span className="sub-nav-indicator">●</span>}
                <span>Danh sách sản phẩm</span>
              </div>
            </div>
          )}
        </div>

        <div className="nav-group">
          <div className={`nav-item ${isInventoryActive ? 'active' : ''}`} onClick={(e) => toggleMenu(e, setInventoryExpanded, inventoryExpanded)}>
            <div className="nav-item-left"><Package size={18} /> <span className="nav-label">Kho hàng</span></div>
            {(inventoryExpanded && isSidebarOpen) ? <ChevronDown size={16} className="nav-chevron" /> : <ChevronRight size={16} className="nav-chevron" />}
          </div>
          
          {(inventoryExpanded || !isSidebarOpen) && (
            <div className="nav-sub-menu">
              <div className="nav-sub-title">Kho hàng</div>
              <div className={`sub-nav-item ${isActive('/dashboard/inventory/manage') ? 'active' : ''}`} onClick={() => navigateTo('/dashboard/inventory/manage', 'inventory')}>
                {isActive('/dashboard/inventory/manage') && <span className="sub-nav-indicator">●</span>}
                <span>Quản lý tồn kho</span>
              </div>
              <div className={`sub-nav-item ${isActive('/dashboard/inventory/history') ? 'active' : ''}`} onClick={() => navigateTo('/dashboard/inventory/history', 'inventory')}>
                {isActive('/dashboard/inventory/history') && <span className="sub-nav-indicator">●</span>}
                <span>Lịch sử biến động</span>
              </div>
            </div>
          )}
        </div>

        <div className="nav-group">
          <div className={`nav-item ${isStaffActive ? 'active' : ''}`} onClick={(e) => toggleMenu(e, setStaffExpanded, staffExpanded)}>
            <div className="nav-item-left"><Users size={18} /> <span className="nav-label">Nhân viên</span></div>
            {(staffExpanded && isSidebarOpen) ? <ChevronDown size={16} className="nav-chevron" /> : <ChevronRight size={16} className="nav-chevron" />}
          </div>
          
          {(staffExpanded || !isSidebarOpen) && (
            <div className="nav-sub-menu">
              <div className="nav-sub-title">Nhân viên</div>
              <div className={`sub-nav-item ${(isActive('/dashboard/staff/list') || isActive('/dashboard/staff', true)) ? 'active' : ''}`} onClick={() => navigateTo('/dashboard/staff/list', 'staff')}>
                {(isActive('/dashboard/staff/list') || isActive('/dashboard/staff', true)) && <span className="sub-nav-indicator">●</span>}
                <span>Danh sách nhân viên</span>
              </div>
              <div className={`sub-nav-item ${isActive('/dashboard/staff/pending') ? 'active' : ''}`} onClick={() => navigateTo('/dashboard/staff/pending', 'staff')}>
                {isActive('/dashboard/staff/pending') && <span className="sub-nav-indicator">●</span>}
                <span>Yêu cầu phê duyệt</span>
              </div>
              <div className={`sub-nav-item ${isActive('/dashboard/staff/history') ? 'active' : ''}`} onClick={() => navigateTo('/dashboard/staff/history', 'staff')}>
                {isActive('/dashboard/staff/history') && <span className="sub-nav-indicator">●</span>}
                <span>Lịch sử phê duyệt</span>
              </div>
            </div>
          )}
        </div>

        <div className="nav-group">
          <div className={`nav-item ${isActive('/dashboard/tables') ? 'active' : ''}`} onClick={() => navigateTo('/dashboard/tables')}>
            <div className="nav-item-left"><Coffee size={18} /> <span className="nav-label">Bàn</span></div>
          </div>
        </div>

        <div className="nav-group">
          <div className={`nav-item ${isActive('/dashboard/promotions') ? 'active' : ''}`} onClick={() => navigateTo('/dashboard/promotions')}>
            <div className="nav-item-left"><Tag size={18} /> <span className="nav-label">Khuyến mãi</span></div>
          </div>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="nav-group">
          <div className={`nav-item ${isActive('/dashboard/settings') ? 'active' : ''}`} onClick={() => navigateTo('/dashboard/settings')}>
            <div className="nav-item-left"><Settings size={18} /> <span className="nav-label">Thiết lập</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
