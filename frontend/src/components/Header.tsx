import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, HelpCircle, Heart, Bell, ChevronDown, LogOut,
         Home, BarChart2, ShoppingCart, Package, Users, Coffee, Tag, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clearAuth } from '../utils/auth';
import logoUrl from '../../assets/favicon/logoname.png';
import './Header.css';

export default function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const profileRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const staffName = localStorage.getItem('staffName') || 'Người dùng';
  const staffEmail = localStorage.getItem('staffEmail') || '';
  const role = localStorage.getItem('role') || 'MANAGER';
  const avatarLetter = staffName.trim().charAt(0).toUpperCase();
  const roleLabel = role === 'STAFF' ? 'Nhân viên' : 'Quản lý';

  // ---- Search ----
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

  const NAV_ITEMS = [
    { label: 'Tổng quan',            path: '/dashboard',                          icon: <Home size={16} /> },
    { label: 'Báo cáo - Doanh thu',  path: '/dashboard/reports/revenue',          icon: <BarChart2 size={16} /> },
    { label: 'Báo cáo - Sản phẩm',  path: '/dashboard/reports/products',         icon: <BarChart2 size={16} /> },
    { label: 'Báo cáo - Nhân viên', path: '/dashboard/reports/staff',            icon: <BarChart2 size={16} /> },
    { label: 'Đơn hàng',            path: '/dashboard/orders',                   icon: <ShoppingCart size={16} /> },
    { label: 'Sản phẩm - Danh mục', path: '/dashboard/products/categories',      icon: <Package size={16} /> },
    { label: 'Sản phẩm - Danh sách',path: '/dashboard/products/list',            icon: <Package size={16} /> },
    { label: 'Kho hàng - Quản lý tồn kho',  path: '/dashboard/inventory/manage',    icon: <Package size={16} /> },
    { label: 'Kho hàng - Lịch sử biến động',path: '/dashboard/inventory/history',   icon: <Package size={16} /> },
    { label: 'Nhân viên - Danh sách',path: '/dashboard/staff/list',              icon: <Users size={16} /> },
    { label: 'Nhân viên - Yêu cầu phê duyệt',path: '/dashboard/staff/pending',  icon: <Users size={16} /> },
    { label: 'Nhân viên - Lịch sử phê duyệt',path: '/dashboard/staff/history',  icon: <Users size={16} /> },
    { label: 'Bàn',                 path: '/dashboard/tables',                   icon: <Coffee size={16} /> },
    { label: 'Khuyến mãi',          path: '/dashboard/promotions',               icon: <Tag size={16} /> },
    { label: 'Thiết lập',           path: '/dashboard/settings',                 icon: <Settings size={16} /> },
  ];

  const searchResults = query.trim()
    ? NAV_ITEMS.filter(item =>
        item.label.toLowerCase().includes(query.trim().toLowerCase())
      )
    : [];

  const handleSelectResult = (path: string) => {
    setQuery('');
    navigate(path);
  };

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate dropdown position based on the profile container's position
  const updateDropdownPos = () => {
    if (profileRef.current) {
      const rect = profileRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 16,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  const handleToggle = () => {
    updateDropdownPos();
    setIsProfileOpen(prev => !prev);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        profileRef.current && 
        !profileRef.current.contains(target) &&
        (!dropdownRef.current || !dropdownRef.current.contains(target))
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  return (
    <div className="header">
      <div className="header-left">
        <img src={logoUrl} alt="ViePOS Logo" className="header-logo-img" />
      </div>

      <div className="header-search" ref={searchRef}>
        <input
          type="text"
          placeholder="Tìm kiếm trang..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <Search size={18} className="search-icon" />
        {searchResults.length > 0 && (
          <div className="search-dropdown">
            {searchResults.map(item => (
              <div
                key={item.path}
                className="search-result-item"
                onMouseDown={() => handleSelectResult(item.path)}
              >
                <span className="search-result-icon">{item.icon}</span>
                <span className="search-result-label">{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="header-right">
        <button className="header-icon-btn"><HelpCircle size={20} /></button>
        <button className="header-icon-btn"><Heart size={20} /></button>
        <button className="header-icon-btn"><Bell size={20} /></button>
        
        <div className="header-divider"></div>
        
        <div className="header-profile-container" ref={profileRef}>
          <div className="header-profile" onClick={handleToggle}>
            <div className="header-avatar">
              <span style={{ fontWeight: 600 }}>{avatarLetter}</span>
            </div>
            <div className="header-user-info">
              <span className="header-username" title={staffEmail}>{staffName}</span>
              <span className="header-role">{roleLabel}</span>
            </div>
            <ChevronDown size={16} color="#888" style={{ transform: isProfileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </div>

          {isProfileOpen && createPortal(
            <div
              ref={dropdownRef}
              className="profile-dropdown"
              style={{
                position: 'fixed',
                top: dropdownPos.top,
                left: dropdownPos.left,
                minWidth: dropdownPos.width || 160,
              }}
            >
              <div className="dropdown-item" onClick={handleLogout}>
                <LogOut size={16} />
                <span>Đăng xuất</span>
              </div>
            </div>,
            document.body
          )}
        </div>
      </div>
    </div>
  );
}
