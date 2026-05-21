import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, X, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../services/api';
import './StaffLoginPage.css';

export default function StaffLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [emailError, setEmailError] = useState('');

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
          navigate('/pos/sales');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.');
      } finally {
        setIsSubmitting(false);
      }
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
            <a href="#" className="staff-forgot-pin">Quên Mã PIN?</a>
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

        </form>
      </div>
    </div>
  );
}
