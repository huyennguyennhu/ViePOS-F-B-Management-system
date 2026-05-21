import { NavLink } from 'react-router-dom';
import { Home, Store, FileText, User } from 'lucide-react';
import './BottomNav.css';

// Custom SVG Icon for Table (Bàn) based on the image
const TableIcon = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 8h16" />
    <path d="M12 8v10" />
    <path d="M9 18h6" />
    <path d="M8 8l-2-4" />
    <path d="M16 8l2-4" />
  </svg>
);

export default function BottomNav() {
  return (
    <div className="bottom-nav">
      <NavLink to="/pos/home" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        {({ isActive }) => (
          <>
            {isActive && <div className="bottom-nav-indicator" />}
            <Home size={22} className="bottom-nav-icon" />
            <span>Trang chủ</span>
          </>
        )}
      </NavLink>

      <NavLink to="/pos/tables" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        {({ isActive }) => (
          <>
            {isActive && <div className="bottom-nav-indicator" />}
            <TableIcon size={22} />
            <span style={{ marginTop: '4px' }}>Bàn</span>
          </>
        )}
      </NavLink>

      <NavLink to="/pos/sales" className={({ isActive }) => `bottom-nav-center-wrapper ${isActive ? 'active' : ''}`}>
        <div className="bottom-nav-center-circle">
          <Store size={26} color="#fff" />
        </div>
        <span className="bottom-nav-center-text">Bán hàng</span>
      </NavLink>

      <NavLink to="/pos/orders" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        {({ isActive }) => (
          <>
            {isActive && <div className="bottom-nav-indicator" />}
            <FileText size={22} className="bottom-nav-icon" />
            <span>Order</span>
          </>
        )}
      </NavLink>

      <NavLink to="/pos/account" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        {({ isActive }) => (
          <>
            {isActive && <div className="bottom-nav-indicator" />}
            <User size={22} className="bottom-nav-icon" />
            <span>Tài khoản</span>
          </>
        )}
      </NavLink>
    </div>
  );
}
