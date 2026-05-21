import { Link, useNavigate } from 'react-router-dom';
import { User, Users } from 'lucide-react';
import './RoleSelectionPage.css';
import heroImg from '../assets/hero.png';

export default function RoleSelectionPage() {
  const navigate = useNavigate();

  return (
    <div className="role-selection-container">
      <div className="role-logo-header">
        <h2>ViePOS</h2>
        <span>xin chào!</span>
      </div>
      
      <p className="role-subtitle">
        Vui lòng chọn đăng nhập với vai trò Chủ quán<br />
        hoặc Nhân viên để tiếp tục.
      </p>

      <div className="role-illustration">
        <img src={heroImg} alt="Role Selection Illustration" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
      </div>

      <div className="role-buttons">
        <button 
          className="role-btn" 
          onClick={() => navigate('/login/manager')}
        >
          <User size={20} />
          Quản Lý
        </button>
        
        <div className="role-divider">Hoặc</div>
        
        <button 
          className="role-btn"
          onClick={() => navigate('/login/staff')}
        >
          <Users size={20} />
          Nhân Viên
        </button>
      </div>

      <div className="role-register">
        Chưa có tài khoản? <Link to="/register">Đăng Ký</Link>
      </div>
    </div>
  );
}
