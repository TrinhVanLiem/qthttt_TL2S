import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';
import { FaGoogle, FaFacebook, FaApple } from 'react-icons/fa';
import { TopBar, Navbar, Footer } from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [searchParams] = useSearchParams();

  // Lỗi từ URL (ví dụ: sau OAuth thất bại)
  const urlError = searchParams.get('error');

  // State đăng nhập
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLoginPw, setShowLoginPw] = useState(false);

  // State đăng ký
  const [regData, setRegData] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [showRegPw, setShowRegPw] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      await login(loginData.email, loginData.password);
      navigate('/');
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');
    if (regData.password !== regData.confirm) return setRegError('Mật khẩu xác nhận không khớp');
    if (!agreed) return setRegError('Vui lòng đồng ý với điều khoản sử dụng');
    setRegLoading(true);
    try {
      await register(regData.name, regData.email, regData.password);
      navigate('/');
    } catch (err) {
      setRegError(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <TopBar />
      <Navbar />
      <div className="auth-content">
        {/* ===== ĐĂNG NHẬP ===== */}
        <div className="auth-card">
          <h2>ĐĂNG NHẬP</h2>
          <p className="auth-subtitle">Chào mừng bạn quay trở lại TravelGuide Hub</p>
          {(loginError || urlError) && <div className="error-msg">{loginError || (urlError === 'google_failed' ? 'Đăng nhập Google thất bại, thử lại.' : urlError)}</div>}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email hoặc số điện thoại</label>
              <div className="input-wrapper">
                <FiUser />
                <input
                  type="email"
                  placeholder="Nhập email hoặc số điện thoại"
                  value={loginData.email}
                  onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Mật khẩu</label>
              <div className="input-wrapper">
                <FiLock />
                <input
                  type={showLoginPw ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu"
                  value={loginData.password}
                  onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
                <span onClick={() => setShowLoginPw(!showLoginPw)} style={{ cursor: 'pointer', color: 'var(--text-gray)' }}>
                  {showLoginPw ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>
            </div>
            <div className="forgot-link">Quên mật khẩu?</div>
            <button type="submit" className="btn-primary" disabled={loginLoading}>
              {loginLoading ? '⏳ Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
          <div className="auth-divider">hoặc đăng nhập với</div>
          <div className="social-buttons">
            <button type="button" className="social-btn" onClick={() => window.location.href = `${BACKEND_URL}/api/auth/google`}
              style={{ background: '#fff', border: '1.5px solid #e5e7eb', fontWeight: 600 }}>
              <FaGoogle color="#ea4335" /> Google
            </button>
            <button type="button" className="social-btn" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}><FaFacebook color="#1877f2" /> Facebook</button>
            <button type="button" className="social-btn" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}><FaApple /> Apple</button>
          </div>
          <p className="auth-switch">Bạn chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
          <div className="auth-security"><FiShield size={14} /> Thông tin của bạn được bảo mật tuyệt đối</div>
        </div>

        {/* ===== ĐĂNG KÝ ===== */}
        <div className="auth-card">
          <h2>ĐĂNG KÝ</h2>
          <p className="auth-subtitle">Tạo tài khoản để mua guide và nhận ưu đãi hấp dẫn</p>
          {regError && <div className="error-msg">{regError}</div>}
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Họ và tên</label>
              <div className="input-wrapper">
                <FiUser />
                <input placeholder="Nhập họ và tên" value={regData.name} onChange={e => setRegData({ ...regData, name: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <div className="input-wrapper">
                <FiMail />
                <input type="email" placeholder="Nhập email của bạn" value={regData.email} onChange={e => setRegData({ ...regData, email: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label>Số điện thoại</label>
              <div className="input-wrapper">
                <FiPhone />
                <input placeholder="Nhập số điện thoại" value={regData.phone} onChange={e => setRegData({ ...regData, phone: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Mật khẩu</label>
              <div className="input-wrapper">
                <FiLock />
                <input type={showRegPw ? 'text' : 'password'} placeholder="Tạo mật khẩu" value={regData.password} onChange={e => setRegData({ ...regData, password: e.target.value })} required />
                <span onClick={() => setShowRegPw(!showRegPw)} style={{ cursor: 'pointer', color: 'var(--text-gray)' }}>
                  {showRegPw ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>
            </div>
            <div className="form-group">
              <label>Xác nhận mật khẩu</label>
              <div className="input-wrapper">
                <FiLock />
                <input type="password" placeholder="Nhập lại mật khẩu" value={regData.confirm} onChange={e => setRegData({ ...regData, confirm: e.target.value })} required />
              </div>
            </div>
            <label className="checkbox-label" style={{ marginBottom: 16 }}>
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
              Tôi đồng ý với <a href="#">Điều khoản sử dụng</a> và <a href="#">Chính sách bảo mật</a>
            </label>
            <button type="submit" className="btn-primary" disabled={regLoading}>
              {regLoading ? '⏳ Đang đăng ký...' : 'Đăng ký'}
            </button>
          </form>
          <div className="auth-divider">hoặc đăng ký với</div>
          <div className="social-buttons">
            <button type="button" className="social-btn" onClick={() => window.location.href = `${BACKEND_URL}/api/auth/google`}
              style={{ background: '#fff', border: '1.5px solid #e5e7eb', fontWeight: 600 }}>
              <FaGoogle color="#ea4335" /> Google
            </button>
            <button type="button" className="social-btn" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}><FaFacebook color="#1877f2" /> Facebook</button>
            <button type="button" className="social-btn" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}><FaApple /> Apple</button>
          </div>
          <p className="auth-switch">Bạn đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link></p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
