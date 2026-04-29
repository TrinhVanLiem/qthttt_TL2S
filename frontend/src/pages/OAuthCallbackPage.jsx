import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Trang này được Google redirect về sau khi OAuth thành công.
 * URL dạng: /oauth-callback?token=xxx&name=xxx&email=xxx&role=xxx&id=xxx
 * Lưu token vào AuthContext rồi redirect về trang chủ.
 */
export default function OAuthCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const token = params.get('token');
    const name  = params.get('name');
    const email = params.get('email');
    const role  = params.get('role');
    const id    = params.get('id');
    const error = params.get('error');

    if (error || !token) {
      navigate('/login?error=google_failed');
      return;
    }

    // Lưu token và thông tin user vào context
    loginWithToken({ _id: id, name, email, role, token });
    navigate('/');
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 48, height: 48, border: '4px solid #e5e7eb', borderTop: '4px solid #1B6B4A', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <div style={{ fontSize: 16, color: '#6b7280', fontWeight: 500 }}>Đang đăng nhập bằng Google...</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
