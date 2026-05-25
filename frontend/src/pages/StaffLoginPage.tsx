import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, X, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../services/api';
import { canAccessManagement, canAccessPos, isStaffRole, getAuthRole } from '../utils/auth';
import './StaffLoginPage.css';

export default function StaffLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Forgot PIN state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotPin, setForgotPin] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');

  const handleTogglePin = () => {
    setShowPin(true);
    setTimeout(() => setShowPin(false), 3000);
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailBlur = () => {
    if (email && !validateEmail(email)) {
      setEmailError('Email không hợp lệ (VD: abc@gmail.com)');
    }
  };

  useEffect(() => {
    if (canAccessManagement()) {
      navigate('/dashboard', { replace: true });
      return;
    }
    if (canAccessPos() && isStaffRole(getAuthRole())) {
      navigate('/pos/sales', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const pinRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handlePinChange = (index: number, value: string) => {
    // Allow only numbers
    if (value && !/^\d+$/.test(value)) return;
    setError('');

    const newPin = [...pin];
    // Keep only the last character if they pasted multiple
    newPin[index] = value.slice(-1);
    setPin(newPin);

    // Auto-advance to next input if value is typed
    if (value && index < 5) {
      pinRefs[index + 1].current?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Auto-focus previous input on backspace if current is empty
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      pinRefs[index - 1].current?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailError('');
    
    if (!validateEmail(email)) {
      setEmailError('Email không hợp lệ (VD: abc@gmail.com)');
      return;
    }

    const fullPin = pin.join('');
    if (fullPin.length !== 6) {
      setError('Vui lòng nhập đủ 6 số mã PIN');
      return;
    }
    
    if (email && fullPin.length === 6) {
      try {
        setIsSubmitting(true);
        const res = await authAPI.staffLogin({ email, pin: fullPin });
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('role', res.data.role);
          localStorage.setItem('staffEmail', email);
          if (res.data.name) localStorage.setItem('staffName', res.data.name);
          if (res.data.id) localStorage.setItem('staffId', res.data.id);
          if (res.data.phone) localStorage.setItem('staffPhone', res.data.phone);
          
          const now = new Date();
          const formattedTime = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
          localStorage.setItem('lastLoginTime', formattedTime);
          
          navigate('/pos/sales');
        }
      } catch (err: any) {
        setError('Email hoặc mã PIN không chính xác.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMessage('');
    
    if (!validateEmail(forgotEmail)) {
      setForgotMessage('Email không hợp lệ.');
      return;
    }
    if (forgotPin.length !== 6 || !/^\d+$/.test(forgotPin)) {
      setForgotMessage('Mã PIN mới phải gồm đúng 6 chữ số.');
      return;
    }

    try {
      setForgotSubmitting(true);
      const res = await authAPI.forgotPin({ email: forgotEmail, newPin: forgotPin });
      setForgotMessage(res.data.message || 'Gửi yêu cầu thành công!');
      setTimeout(() => {
        setIsForgotModalOpen(false);
        setForgotMessage('');
        setForgotEmail('');
        setForgotPin('');
      }, 3000);
    } catch (err: any) {
      setForgotMessage(err.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setForgotSubmitting(false);
    }
  };
  return (
    <div className="staff-login-container">
      <div className="staff-login-card">
        
        <div className="staff-login-header" style={{ marginBottom: '40px' }}>
          <button className="staff-back-btn" onClick={() => navigate('/')}>
            <ChevronLeft size={18} />
          </button>
          <h1 className="staff-login-title">Đăng Nhập - Nhân Viên</h1>
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

          <div className="staff-form-group">
            <label>Email</label>
            <div className="staff-email-input-wrapper" style={{ border: emailError ? '1px solid #c62828' : 'none', borderRadius: '8px' }}>
              <input 
                type="text" 
                placeholder="abc@gmail.com" 
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); setEmailError(''); }}
                onBlur={handleEmailBlur}
                required
              />
              {email && (
                <button type="button" className="staff-clear-btn" onClick={() => { setEmail(''); setError(''); setEmailError(''); }}>
                  <X size={18} />
                </button>
              )}
            </div>
            {emailError && <div style={{ position: 'absolute', bottom: '-18px', left: '4px', color: '#c62828', fontSize: '11px', whiteSpace: 'nowrap' }}>{emailError}</div>}
          </div>

          <div className="staff-form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ marginBottom: 0 }}>Mã PIN</label>
              <button type="button" onClick={handleTogglePin} style={{ background: 'none', border: 'none', padding: 0, color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                {showPin ? <Eye size={16} color="#256E05" /> : <EyeOff size={16} />}
              </button>
            </div>
            <div className="staff-pin-grid">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  ref={pinRefs[index]}
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  className="staff-pin-input"
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handlePinKeyDown(index, e)}
                  maxLength={1}
                  required
                />
              ))}
            </div>
          </div>

          <div className="staff-options-row">
            <label className="staff-fast-login">
              <input type="checkbox" />
              <span>Đăng nhập nhanh</span>
            </label>
            <span onClick={() => setIsForgotModalOpen(true)} className="staff-forgot-pin" style={{ cursor: 'pointer' }}>Quên Mã PIN?</span>
          </div>

          <button type="submit" className="staff-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Đang xử lý...' : 'Đăng Nhập'}
          </button>

          <div className="staff-footer" style={{ marginTop: '15px' }}>
            Chưa có tài khoản? <span onClick={() => navigate('/register/staff')} style={{ color: '#256E05', fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}>Đăng Ký</span>
          </div>

          {/* Toast Notification */}
          {error && (
            <div style={{ 
              position: 'fixed', 
              bottom: '24px', 
              left: '50%', 
              transform: 'translateX(-50%)', 
              backgroundColor: '#ffebee', 
              color: '#c62828', 
              padding: '12px 24px', 
              borderRadius: '8px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              fontSize: '13px', 
              textAlign: 'center',
              zIndex: 1000,
              width: 'max-content',
              maxWidth: '90vw'
            }}>
              {error}
            </div>
          )}

          {/* Forgot PIN Modal */}
          {isForgotModalOpen && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999
            }}>
              <div style={{
                backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '400px'
              }}>
                <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#111' }}>Yêu Cầu Cấp Lại Mã PIN</h3>
                
                <div className="staff-form-group">
                  <label>Email của bạn</label>
                  <input 
                    type="email" 
                    className="staff-pin-input"
                    style={{ width: '100%', padding: '12px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '8px' }}
                    placeholder="abc@gmail.com"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                  />
                </div>

                <div className="staff-form-group">
                  <label>Mã PIN Mới (6 số)</label>
                  <input 
                    type="password" 
                    maxLength={6}
                    className="staff-pin-input"
                    style={{ width: '100%', padding: '12px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '8px', letterSpacing: '8px', fontFamily: 'monospace' }}
                    placeholder="••••••"
                    value={forgotPin}
                    onChange={e => setForgotPin(e.target.value)}
                  />
                </div>

                {forgotMessage && (
                  <div style={{ marginBottom: '16px', padding: '10px', backgroundColor: forgotMessage.includes('thành công') ? '#d4edda' : '#f8d7da', color: forgotMessage.includes('thành công') ? '#155724' : '#721c24', borderRadius: '6px', fontSize: '13px' }}>
                    {forgotMessage}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setIsForgotModalOpen(false)} style={{ flex: 1, padding: '12px', backgroundColor: '#f1f1f1', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Huỷ</button>
                  <button type="button" onClick={handleForgotSubmit} disabled={forgotSubmitting} style={{ flex: 1, padding: '12px', backgroundColor: '#256E05', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                    {forgotSubmitting ? 'Đang gửi...' : 'Gửi Yêu Cầu'}
                  </button>
                </div>
              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  );
}
