import { FaBell, FaSearch, FaChevronDown, FaBars } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export default function AdminHeader({ onMenuToggle }) {
  const { user } = useAuth();
  return (
    <header style={{ position: 'fixed', top: 0, left: 240, right: 0, height: 60, background: 'white', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16, zIndex: 99 }}>
      <button onClick={onMenuToggle} style={{ background: 'none', color: '#374151', fontSize: 18, cursor: 'pointer' }}><FaBars /></button>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 14px', gap: 8, maxWidth: 420 }}>
        <FaSearch size={13} color="#9ca3af" />
        <input placeholder="Tìm kiếm guide, đơn hàng, khách hàng..." style={{ border: 'none', background: 'none', outline: 'none', fontSize: 13, width: '100%', color: '#374151' }} />
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <FaBell size={18} color="#374151" />
          <span style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', color: 'white', fontSize: 9, fontWeight: 700, borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>5</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),#6ee7b7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: 14 }}>
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{user?.name || 'Admin'}</div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>Quản trị viên</div>
          </div>
          <FaChevronDown size={11} color="#9ca3af" />
        </div>
      </div>
    </header>
  );
}
