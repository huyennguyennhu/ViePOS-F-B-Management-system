import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import xGreyIcon from '../../assets/icon/x_grey.png';
import closeEyeIcon from '../../assets/icon/close_eye_grey.png';
import openEyeIcon from '../../assets/icon/open_eye_grey.png';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role ?? 'MANAGER');
      localStorage.setItem('staffEmail', email);
      if (res.data.name) localStorage.setItem('staffName', res.data.name);
      navigate('/dashboard');
    } catch {
      setError('Email hoặc mật khẩu không đúng.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-inner-container">


      <h3 className="login-title">Đăng Nhập - Quản Lý</h3>

      <form onSubmit={handleSubmit} className="login-form">
        <div className="field-group">
          <label htmlFor="email">Email</label>
          <div className="input-wrapper">
            <input
              id="email"
              type="email"
              placeholder="abc@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {email && (
            <img
                src={xGreyIcon}
                alt="Xoá"
                className="input-icon-right"
                onClick={() => setEmail('')}
              />
            )}
          </div>
        </div>

        <div className="field-group">
          <label htmlFor="password">Mật khẩu</label>
          <div className="input-wrapper">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <img
              src={showPassword ? openEyeIcon : closeEyeIcon}
              alt={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              className="input-icon-right"
              onClick={() => setShowPassword(prev => !prev)}
            />
          </div>
        </div>

        {error && <p className="login-error">{error}</p>}

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
        </button>

        <div className="forgot-password">
          <Link to="/forgot-password">Quên Mật khẩu?</Link>
        </div>
      </form>
    </div>
  );
}
