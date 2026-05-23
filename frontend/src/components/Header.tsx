import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, HelpCircle, Heart, Bell, ChevronDown, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoUrl from '../../assets/favicon/logoname.png';
import './Header.css';

export default function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Calculate dropdown position based on the profile container's position
  const updateDropdownPos = () => {
    if (profileRef.current) {
      const rect = profileRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
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
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="header">
      <div className="header-left">
        <img src={logoUrl} alt="ViePOS Logo" className="header-logo-img" />
      </div>

      <div className="header-search">
        <input type="text" placeholder="Tìm kiếm..." />
        <Search size={18} className="search-icon" />
      </div>

      <div className="header-right">
        <button className="header-icon-btn"><HelpCircle size={20} /></button>
        <button className="header-icon-btn"><Heart size={20} /></button>
        <button className="header-icon-btn"><Bell size={20} /></button>
        
        <div className="header-divider"></div>
        
        <div className="header-profile-container" ref={profileRef}>
          <div className="header-profile" onClick={handleToggle}>
            <div className="header-avatar">
              <span style={{ fontWeight: 600 }}>T</span>
            </div>
            <div className="header-user-info">
              <span className="header-username">Tui là who</span>
              <span className="header-role">Quản lý</span>
            </div>
            <ChevronDown size={16} color="#888" style={{ transform: isProfileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </div>

          {isProfileOpen && createPortal(
            <div
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
