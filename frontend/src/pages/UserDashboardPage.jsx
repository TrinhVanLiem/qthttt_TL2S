import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TopBar, Navbar, Footer } from '../components/Layout';
import {
  FaHome, FaBoxOpen, FaBook, FaHeart, FaStar, FaUser, FaLock,
  FaEnvelope, FaCreditCard, FaBell, FaHeadset, FaSignOutAlt,
  FaDownload, FaChevronRight, FaCopy, FaShoppingBag, FaGift,
  FaFileAlt, FaSyncAlt, FaShoppingCart, FaHandshake, FaStore,
  FaCheckCircle, FaTimesCircle, FaClock
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const getMenu = (user, partnerApp) => [
  { key: 'overview',  label: 'Tổng quan',             icon: <FaHome /> },
  { key: 'orders',    label: 'Đơn hàng của tôi',      icon: <FaBoxOpen /> },
  { key: 'products',  label: 'Sản phẩm của tôi',      icon: <FaBook /> },
  { key: 'wishlist',  label: 'Yêu thích',              icon: <FaHeart /> },
  { key: 'reviews',   label: 'Đánh giá của tôi',      icon: <FaStar /> },
  { key: 'account',   label: 'Thông tin tài khoản',   icon: <FaUser /> },
  { key: 'password',  label: 'Đổi mật khẩu',          icon: <FaLock /> },
  { key: 'email',     label: 'Địa chỉ email',         icon: <FaEnvelope /> },
  { key: 'payment',   label: 'Phương thức thanh toán', icon: <FaCreditCard /> },
  { key: 'notify',    label: 'Thông báo',              icon: <FaBell />, badge: true },
  { key: 'support',   label: 'Hỗ trợ & khiếu nại',   icon: <FaHeadset /> },
  // Partner menu
  ...(user?.role === 'partner'
    ? [{ key: 'partner', label: 'Quản lý Ebook', icon: <FaStore />, highlight: true }]
    : [{ key: 'partner', label: 'Đăng ký Đối tác', icon: <FaHandshake />,
        badge: partnerApp?.status === 'pending' }]
  ),
];

const DUMMY_PRODUCTS = [
  { name: 'Đà Nẵng 5N4Đ', color: '#2563eb' },
  { name: 'Phú Quốc 4N3Đ', color: '#16a34a' },
  { name: 'Hà Giang 4N3Đ', color: '#7c3aed' },
  { name: 'Đà Lạt 3N2Đ', color: '#dc2626' },
  { name: 'Nha Trang 3N2Đ', color: '#0891b2' },
  { name: 'Hội An 2N1Đ', color: '#d97706' },
  { name: 'Sapa 3N2Đ', color: '#059669' },
];

export default function UserDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [partnerApp, setPartnerApp] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/orders/my').then(r => setOrders(r.data)).finally(() => setLoading(false));
    api.get('/partner/application').then(r => setPartnerApp(r.data)).catch(() => {});
  }, [user]);

  const MENU = getMenu(user, partnerApp);

  const handleLogout = () => { logout(); navigate('/'); };
  const copyCode = (code) => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  if (!user) return null;
  const totalSpent = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const memberLevel = totalSpent >= 3000000 ? 'Gold' : totalSpent >= 1800000 ? 'Silver' : 'Member';
  const nextLevel = memberLevel === 'Gold' ? 3000000 : 3000000;
  const progress = Math.min(100, Math.round(totalSpent / nextLevel * 100));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f4f6f8' }}>
      <TopBar />
      <Navbar />
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, padding: '28px 20px', flex: 1 }}>

        {/* ===== SIDEBAR ===== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {/* Profile card */}
          <div style={{ background: 'white', borderRadius: 12, padding: '20px 16px', marginBottom: 12, textAlign: 'center', border: '1px solid var(--border)' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#1B6B4A,#2a9d5c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: 'white', margin: '0 auto 10px' }}>
              {user.name?.charAt(0)?.toUpperCase()}
            </div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{user.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-gray)', marginBottom: 8 }}>{user.email}</div>
            <span style={{ background: '#f0faf5', color: 'var(--primary)', fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 20, border: '1px solid var(--primary)' }}>
              {memberLevel === 'Gold' ? '⭐ Gold' : memberLevel === 'Silver' ? '🥈 Silver' : '🏅 Thành viên'}
            </span>
          </div>

          {/* Nav */}
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
            {MENU.map(m => (
              <button key={m.key} onClick={() => {
                if (m.key === 'partner') {
                  if (user?.role === 'partner') navigate('/partner');
                  else navigate('/partner/apply');
                } else {
                  setTab(m.key);
                }
              }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', background: tab === m.key ? 'var(--primary-light)' : m.highlight ? '#f0faf5' : 'none', color: tab === m.key ? 'var(--primary)' : m.highlight ? 'var(--primary)' : 'var(--text-dark)', fontWeight: tab === m.key || m.highlight ? 700 : 400, fontSize: 13, borderLeft: tab === m.key ? '3px solid var(--primary)' : '3px solid transparent', borderBottom: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', position: 'relative' }}>
                <span style={{ color: tab === m.key || m.highlight ? 'var(--primary)' : 'var(--text-gray)' }}>{m.icon}</span>
                {m.label}
                {m.badge && <span style={{ position: 'absolute', right: 12, background: '#ef4444', color: 'white', width: 8, height: 8, borderRadius: '50%' }} />}
              </button>
            ))}
            <button onClick={handleLogout}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', color: '#ef4444', fontWeight: 600, fontSize: 13, cursor: 'pointer', background: 'none', fontFamily: 'inherit', textAlign: 'left' }}>
              <FaSignOutAlt /> Đăng xuất
            </button>
          </div>
        </div>

        {/* ===== MAIN CONTENT ===== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Welcome banner */}
          <div style={{ background: 'linear-gradient(135deg,#1B6B4A,#2a9d5c)', borderRadius: 12, padding: '24px 28px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Xin chào, {user.name} 👋</div>
              <div style={{ fontSize: 13, opacity: 0.85 }}>Chào mừng bạn quay trở lại với TravelGuide Hub</div>
              <div style={{ fontSize: 13, opacity: 0.75, marginTop: 2 }}>Cùng khám phá thêm nhiều guide du lịch hấp dẫn nhé!</div>
            </div>
            <div style={{ fontSize: 72, opacity: 0.15, position: 'absolute', right: 24 }}>🧭</div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
            {[
              { icon: <FaShoppingBag size={22} color="var(--primary)" />, label: 'Đơn hàng', val: orders.length, link: '/orders', sub: 'Xem tất cả đơn hàng', color: '#f0faf5' },
              { icon: <FaBook size={22} color="#2563eb" />, label: 'Sản phẩm đã mua', val: orders.reduce((s,o)=>s+(o.items?.length||0),0), link: '/orders', sub: 'Xem thư viện của tôi', color: '#eff6ff' },
              { icon: <FaHeart size={22} color="#ef4444" />, label: 'Sản phẩm yêu thích', val: 0, sub: 'Xem danh sách yêu thích', color: '#fef2f2' },
              { icon: <FaStar size={22} color="#f59e0b" />, label: 'Đánh giá của tôi', val: 0, sub: 'Xem tất cả đánh giá', color: '#fffbeb' },
            ].map((s, i) => (
              <div key={i} style={{ background: s.color || 'white', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 16px', cursor: s.link ? 'pointer' : 'default' }}
                onClick={() => s.link && navigate(s.link)}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 13, color: 'var(--text-gray)', marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)', marginBottom: 8 }}>{s.val}</div>
                <div style={{ fontSize: 12, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                  {s.sub} <FaChevronRight size={9} />
                </div>
              </div>
            ))}
          </div>

          {/* Orders + Products 2 col */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Recent orders */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Đơn hàng gần đây</div>
                <Link to="/orders" style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>Xem tất cả</Link>
              </div>
              {loading ? <div style={{ color: 'var(--text-gray)', fontSize: 13 }}>Đang tải...</div>
                : orders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-gray)', fontSize: 13 }}>
                    <FaShoppingBag size={28} style={{ marginBottom: 8, opacity: 0.3 }} />
                    <div>Chưa có đơn hàng nào</div>
                  </div>
                ) : orders.slice(0, 5).map(order => (
                  <div key={order._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{order.items?.[0]?.title || 'Guide du lịch'}{order.items?.length > 1 ? ` +${order.items.length - 1}` : ''}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-gray)' }}>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 12 }}>Đã hoàn thành</span>
                      <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{order.totalAmount?.toLocaleString('vi-VN')}đ</div>
                    </div>
                  </div>
                ))}
              <Link to="/orders" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14, padding: '10px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text-dark)', fontWeight: 600 }}>
                Xem tất cả đơn hàng <FaChevronRight size={10} />
              </Link>
            </div>

            {/* Purchased products */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Sản phẩm đã mua</div>
                <Link to="/orders" style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>Xem tất cả</Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                {DUMMY_PRODUCTS.slice(0, 7).map((p, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ width: '100%', aspectRatio: '3/4', background: `linear-gradient(135deg,${p.color},${p.color}99)`, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4, fontSize: 10, color: 'white', fontWeight: 700, padding: 4, lineHeight: 1.3 }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-gray)', marginBottom: 4, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{p.name}</div>
                    <button style={{ background: 'var(--primary)', color: 'white', borderRadius: 4, padding: '3px 0', width: '100%', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                      <FaDownload size={9} />
                    </button>
                  </div>
                ))}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '100%', aspectRatio: '3/4', background: '#f8fafb', border: '2px dashed var(--border)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4, fontSize: 20, color: 'var(--text-gray)' }}>+</div>
                  <Link to="/explore" style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 600 }}>Xem tất cả</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Promo + Member + Support row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {/* Promo */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f0faf5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FaGift size={18} color="var(--primary)" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>Ưu đãi dành riêng cho bạn</div>
                  <div style={{ fontSize: 12, color: 'var(--text-gray)' }}>Giảm 15% cho đơn hàng tiếp theo</div>
                  <div style={{ fontSize: 11, color: 'var(--text-gray)' }}>Áp dụng cho tất cả guide du lịch. HSD: 31/05/2024</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ flex: 1, background: '#f8fafb', border: '1.5px dashed var(--border)', borderRadius: 6, padding: '8px 12px', fontSize: 14, fontWeight: 800, letterSpacing: 2, color: 'var(--primary)' }}>TAM15</div>
                <button onClick={() => copyCode('TAM15')} style={{ background: 'var(--primary)', color: 'white', padding: '8px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <FaCopy size={11} /> {copied ? 'Đã sao chép!' : 'Sao chép'}
                </button>
              </div>
            </div>

            {/* Membership */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Thành viên thân thiết</div>
                <span style={{ background: '#f1f5f9', color: '#64748b', fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 12 }}>{memberLevel}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-gray)', marginBottom: 10 }}>
                Bạn cần mua thêm <strong>{Math.max(0,(nextLevel - totalSpent)).toLocaleString('vi-VN')}đ</strong> để lên hạng Gold
              </div>
              <div style={{ height: 8, background: '#e5e7eb', borderRadius: 4, marginBottom: 6, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'linear-gradient(to right,var(--primary),#6ee7b7)', borderRadius: 4, width: `${progress}%`, transition: 'width 0.8s' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-gray)' }}>
                <span>{totalSpent.toLocaleString('vi-VN')}đ</span>
                <span>{nextLevel.toLocaleString('vi-VN')}đ</span>
              </div>
              <button style={{ marginTop: 12, fontSize: 12, color: 'var(--primary)', fontWeight: 600, background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                Xem quyền lợi thành viên <FaChevronRight size={9} />
              </button>
            </div>

            {/* Support */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f0faf5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FaHeadset size={18} color="var(--primary)" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>Hỗ trợ nhanh</div>
                  <div style={{ fontSize: 12, color: 'var(--text-gray)' }}>Bạn cần hỗ trợ?</div>
                  <div style={{ fontSize: 12, color: 'var(--text-gray)' }}>Đội ngũ của chúng tôi luôn sẵn sàng giúp bạn 24/7</div>
                </div>
              </div>
              <button style={{ background: 'var(--primary)', color: 'white', padding: '9px 20px', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                Liên hệ hỗ trợ
              </button>
            </div>
          </div>

          {/* Feature badges */}
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 24px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0 }}>
            {[
              { icon: <FaShoppingCart size={26} color="var(--primary)" />, title: 'Mua là tải ngay', desc: 'Thanh toán thành công là tải về được ngay' },
              { icon: <FaFileAlt size={26} color="#2563eb" />, title: 'File chất lượng cao', desc: 'PDF rõ nét, bố cục đẹp, dễ đọc trên mọi thiết bị' },
              { icon: <FaSyncAlt size={26} color="#16a34a" />, title: 'Cập nhật miễn phí', desc: 'Nội dung được cập nhật thường xuyên' },
              { icon: <FaHeadset size={26} color="#7c3aed" />, title: 'Hỗ trợ 24/7', desc: 'Đội ngũ hỗ trợ luôn sẵn sàng giúp bạn' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '12px 16px', borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ marginBottom: 8 }}>{f.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-gray)', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            ))}
          </div>

          {/* ===== PARTNER TAB ===== */}
          {tab === 'partner' && (
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f0faf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaHandshake size={22} color="var(--primary)" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 17 }}>Chương trình Đối tác</div>
                  <div style={{ fontSize: 13, color: 'var(--text-gray)' }}>Kiếm thu nhập từ việc đăng tải guide du lịch</div>
                </div>
              </div>

              {!partnerApp && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
                    {[
                      { icon: '70%', title: 'Hoa hồng', desc: 'Nhận 70% doanh thu mỗi ebook bán ra', color: '#f0faf5', c: 'var(--primary)' },
                      { icon: '∞', title: 'Không giới hạn', desc: 'Đăng tải bao nhiêu ebook tùy bạn muốn', color: '#eff6ff', c: '#2563eb' },
                      { icon: '24/7', title: 'Hỗ trợ ưu tiên', desc: 'Được hỗ trợ riêng biệt và nhanh chóng', color: '#fdf4ff', c: '#7c3aed' },
                    ].map((b, i) => (
                      <div key={i} style={{ background: b.color, borderRadius: 10, padding: '16px 18px', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 24, fontWeight: 900, color: b.c, marginBottom: 4 }}>{b.icon}</div>
                        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{b.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-gray)' }}>{b.desc}</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => navigate('/partner/apply')}
                    style={{ background: 'var(--primary)', color: 'white', padding: '12px 32px', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FaHandshake /> Đăng ký đối tác ngay
                  </button>
                </>
              )}

              {partnerApp?.status === 'pending' && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: 20, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <FaClock size={24} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#92400e', marginBottom: 4 }}>Đơn đăng ký đang chờ duyệt</div>
                    <div style={{ fontSize: 13, color: '#92400e' }}>Admin sẽ xem xét đơn của bạn trong 1-3 ngày làm việc. Chúng tôi sẽ gửi email thông báo khi có kết quả.</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>Nộp đơn lúc: {new Date(partnerApp.createdAt).toLocaleDateString('vi-VN')}</div>
                  </div>
                </div>
              )}

              {partnerApp?.status === 'approved' && (
                <div style={{ background: '#f0faf5', border: '1px solid #6ee7b7', borderRadius: 10, padding: 20, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <FaCheckCircle size={24} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#065f46', marginBottom: 4 }}>Bạn đã là Đối tác!</div>
                    <div style={{ fontSize: 13, color: '#065f46', marginBottom: 12 }}>Tài khoản của bạn đã được cấp quyền Partner. Bạn có thể bắt đầu đăng tải ebook ngay bây giờ.</div>
                    <button onClick={() => navigate('/partner')}
                      style={{ background: 'var(--primary)', color: 'white', padding: '10px 24px', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <FaStore /> Vào Partner Dashboard
                    </button>
                  </div>
                </div>
              )}

              {partnerApp?.status === 'rejected' && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: 20, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <FaTimesCircle size={24} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#991b1b', marginBottom: 4 }}>Đơn chưa được duyệt</div>
                    <div style={{ fontSize: 13, color: '#991b1b', marginBottom: 4 }}><strong>Lý do:</strong> {partnerApp.rejectedReason}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>Bạn có thể liên hệ hỗ trợ để biết thêm chi tiết.</div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
      <Footer />
    </div>
  );
}
