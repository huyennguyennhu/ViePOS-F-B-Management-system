import { Outlet } from 'react-router-dom';
import './AuthLayout.css';

export default function AuthLayout() {
  return (
    <div className="auth-layout-container">
      <div className="auth-left-panel">
        <div className="auth-branding">
          <p>Cung cấp</p>
          <h1>Giải pháp số cho hoạt động<br />kinh doanh F&B.</h1>
        </div>
      </div>
      <div className="auth-right-panel">
        <Outlet />
      </div>
    </div>
  );
}
