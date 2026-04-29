import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaHome, FaBook, FaThLarge, FaBoxOpen, FaUsers, FaStar, FaTag, FaFileAlt, FaImage, FaFileCode, FaLock, FaCog, FaList, FaSignOutAlt, FaCompass, FaHandshake, FaClock } from 'react-icons/fa';

const getSections = (badges = {}) => [
  { title: 'QUẢN LÝ', items: [
    { key: 'dashboard',     label: 'Tổng quan',           icon: <FaHome /> },
    { key: 'ebooks',        label: 'Guide (Sản phẩm)',    icon: <FaBook /> },
    { key: 'categories',    label: 'Danh mục',             icon: <FaThLarge /> },
    { key: 'orders',        label: 'Đơn hàng',            icon: <FaBoxOpen /> },
    { key: 'customers',     label: 'Khách hàng',          icon: <FaUsers /> },
    { key: 'reviews',       label: 'Đánh giá',            icon: <FaStar /> },
    { key: 'promotions',    label: 'Ưu đãi / Mã giảm giá', icon: <FaTag /> },
    { key: 'partner-apps',  label: 'Đơn đối tác',         icon: <FaHandshake />, badge: badges.partnerApps },
    { key: 'pending-ebooks',label: 'Ebook chờ duyệt',     icon: <FaClock />,     badge: badges.pendingEbooks },
  ]},
  { title: 'NỘI DUNG', items: [
    { key: 'blog',    label: 'Bài viết blog',   icon: <FaFileAlt /> },
    { key: 'banners', label: 'Slider / Banner', icon: <FaImage /> },
    { key: 'pages',   label: 'Trang tĩnh',      icon: <FaFileCode /> },
  ]},
  { title: 'QUẢN TRỊ HỆ THỐNG', items: [
    { key: 'users',    label: 'Người dùng',        icon: <FaUsers /> },
    { key: 'roles',    label: 'Phân quyền',        icon: <FaLock /> },
    { key: 'settings', label: 'Cài đặt hệ thống', icon: <FaCog /> },
    { key: 'logs',     label: 'Nhật ký hoạt động', icon: <FaList /> },
  ]},
];

export default function AdminSidebar({ tab, setTab, badges = {} }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const SECTIONS = getSections(badges);

  return (
    <aside style={{ width: 240, minHeight: '100vh', background: 'white', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100 }}>
      {/* Logo */}
      <div style={{ padding: '18px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 32, height: 32, background: 'var(--primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FaCompass color="white" size={16} />
        </div>
        <span style={{ fontWeight: 800, fontSize: 16 }}>
          <span style={{ color: 'var(--primary)' }}>Travel</span>
          <span style={{ color: '#e8a020' }}>Guide</span>
          <span style={{ color: '#374151', fontWeight: 600 }}> Hub</span>
        </span>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
        {SECTIONS.map(sec => (
          <div key={sec.title} style={{ marginBottom: 4 }}>
            <div style={{ padding: '8px 20px 4px', fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase' }}>{sec.title}</div>
            {sec.items.map(item => {
              const active = tab === item.key;
              return (
                <button key={item.key} onClick={() => setTab(item.key)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 20px', background: active ? '#f0faf5' : 'transparent', color: active ? 'var(--primary)' : '#374151', fontWeight: active ? 700 : 400, fontSize: 13, borderLeft: active ? '3px solid var(--primary)' : '3px solid transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', borderBottom: 'none', borderTop: 'none', borderRight: 'none', position: 'relative' }}>
                  <span style={{ color: active ? 'var(--primary)' : '#9ca3af', fontSize: 13 }}>{item.icon}</span>
                  {item.label}
                  {item.badge > 0 && (
                    <span style={{ position: 'absolute', right: 14, background: '#ef4444', color: 'white', fontSize: 10, fontWeight: 700, minWidth: 18, height: 18, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{item.badge}</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Back to site + Logout */}
      <div style={{ borderTop: '1px solid #e5e7eb', padding: '12px 0' }}>
        <button onClick={() => navigate('/')}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', color: 'var(--primary)', fontWeight: 600, fontSize: 13, cursor: 'pointer', background: 'none', fontFamily: 'inherit' }}>
          <FaCompass size={13} /> Về trang chủ
        </button>
        <button onClick={() => { logout(); navigate('/'); }}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', color: '#ef4444', fontWeight: 600, fontSize: 13, cursor: 'pointer', background: 'none', fontFamily: 'inherit' }}>
          <FaSignOutAlt size={13} /> Đăng xuất
        </button>
      </div>

      {/* Version */}
      <div style={{ padding: '8px 20px', fontSize: 11, color: '#9ca3af', borderTop: '1px solid #e5e7eb' }}>Phiên bản 1.0.0</div>
    </aside>
  );
}
