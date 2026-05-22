import { Camera, Edit2, Contact, User, Phone, Mail, Calendar, ChevronUp, ChevronDown, ChevronRight, RefreshCw, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './PosAccountPage.css';

export default function PosAccountPage() {
  const navigate = useNavigate();
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);
  const [isSecurityExpanded, setIsSecurityExpanded] = useState(false);
  
  const staffName = localStorage.getItem('staffName') || 'Nguyễn Văn A';
  const staffEmail = localStorage.getItem('staffEmail') || 'nguyenvana@gmail.com';
  // Translate role from ID/english to Vietnamese if needed, or just use as is
  const staffRole = localStorage.getItem('staffRole') || 'Nhân viên Thu ngân';
  const roleDisplay = staffRole.includes('admin') ? 'Quản lý' : 'Nhân viên Thu ngân';
  
  const staffId = localStorage.getItem('staffId') || 'NV000123';
  const staffPhone = localStorage.getItem('staffPhone') || 'Chưa cập nhật';
  const lastLoginTime = localStorage.getItem('lastLoginTime') || 'Chưa rõ';
  
  const handleLogout = () => {
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffRole');
    localStorage.removeItem('staffName');
    localStorage.removeItem('staffEmail');
    localStorage.removeItem('staffId');
    localStorage.removeItem('staffPhone');
    localStorage.removeItem('lastLoginTime');
    navigate('/staff/login');
  };

  return (
    <div className="pos-account-container">
      <h2 className="pos-account-title">Tài khoản cá nhân</h2>

      {/* Profile Card */}
      <div className="account-card profile-card">
        <div className="profile-header">
          <div className="avatar-wrapper">
            <User size={36} color="#aaa" />
            <div className="avatar-camera-btn">
              <Camera size={12} strokeWidth={3} />
            </div>
          </div>
          <div className="profile-info">
            <div className="profile-name-row">
              <div className="profile-name">{staffName}</div>
              <Edit2 size={14} color="#666" />
            </div>
            <div className="profile-id">ID: <span>{staffId.substring(0, 8)}</span></div>
            <div className="status-badge-wrapper">
              <div className="status-badge">
                <div className="status-dot"></div>
                Đang hoạt động
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role Card */}
      <div className="account-card role-card">
        <div className="role-icon-wrapper">
          <Contact size={20} strokeWidth={2.5} />
        </div>
        <div>
          <div className="role-title">{roleDisplay}</div>
          {/* <div className="role-desc">Quản lý bán hàng, thanh toán và chăm sóc khách hàng</div> */}
        </div>
      </div>

      {/* Account Info Section */}
      <div className="account-card">
        <div className="section-header" onClick={() => setIsInfoExpanded(!isInfoExpanded)} style={{ cursor: 'pointer', marginBottom: isInfoExpanded ? '12px' : '0' }}>
          <div className="section-title-wrapper">
            <User size={20} color="#306B0E" strokeWidth={2.5} />
            Thông tin tài khoản
          </div>
          {isInfoExpanded ? <ChevronUp size={20} color="#666" /> : <ChevronDown size={20} color="#666" />}
        </div>
        
        {isInfoExpanded && (
          <div className="section-content">
            <div className="info-row">
              <div className="info-label">
                <div className="info-icon-wrapper">
                  <Phone size={14} strokeWidth={2.5} />
                </div>
                Số điện thoại
              </div>
              <div className="info-value">{staffPhone}</div>
            </div>

            <div className="info-row">
              <div className="info-label">
                <div className="info-icon-wrapper">
                  <Mail size={14} strokeWidth={2.5} />
                </div>
                Email
              </div>
              <div className="info-value">{staffEmail}</div>
            </div>

            <div className="info-row">
              <div className="info-label">
                <div className="info-icon-wrapper">
                  <Calendar size={14} strokeWidth={2.5} />
                </div>
                Đăng nhập lần cuối
              </div>
              <div className="info-value gray">{lastLoginTime}</div>
            </div>
          </div>
        )}
      </div>

      {/* Security Section */}
      <div className="account-card">
        <div className="section-header" onClick={() => setIsSecurityExpanded(!isSecurityExpanded)} style={{ cursor: 'pointer', marginBottom: isSecurityExpanded ? '12px' : '0' }}>
          <div className="section-title-wrapper">
            <User size={20} color="#306B0E" strokeWidth={2.5} />
            Bảo mật tài khoản
          </div>
          {isSecurityExpanded ? <ChevronUp size={20} color="#666" /> : <ChevronDown size={20} color="#666" />}
        </div>

        {isSecurityExpanded && (
          <div className="section-content">
            <div className="action-row" onClick={() => navigate('/pos/change-pin')}>
              <div className="action-info">
                <div className="action-icon-wrapper">
                  <RefreshCw size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="action-title">Đổi mã PIN</div>
                  <div className="action-desc">Cập nhật mã PIN để bảo vệ tài khoản</div>
                </div>
              </div>
              <ChevronRight size={18} color="#666" />
            </div>
          </div>
        )}
      </div>

      {/* Logout Button */}
      <button className="logout-btn" onClick={handleLogout}>
        <LogOut size={20} strokeWidth={2.5} />
        Đăng Xuất
      </button>

    </div>
  );
}
