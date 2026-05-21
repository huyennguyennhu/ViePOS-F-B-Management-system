import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, EyeOff } from 'lucide-react';
import api from '../services/api';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch {
      setError('Email hoặc mật khẩu không đúng.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-inner-container">
      <div className="login-header">
        <h2>ViePOS</h2>
      </div>

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
              <X 
                size={18} 
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
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <EyeOff size={18} className="input-icon-right" />
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
