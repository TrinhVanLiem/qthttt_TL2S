import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TopBar, Navbar, Footer } from '../components/Layout';
import {
  FaHome, FaBoxOpen, FaBook, FaStar, FaUser, FaLock,
  FaHeadset, FaSignOutAlt, FaDownload, FaChevronRight,
  FaCopy, FaShoppingBag, FaGift, FaFileAlt, FaSyncAlt,
  FaShoppingCart, FaHandshake, FaStore,
  FaCheckCircle, FaTimesCircle, FaClock, FaCommentAlt
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const MENU = [
  { key: 'overview',  label: 'Tổng quan',           icon: <FaHome /> },
  { key: 'orders',    label: 'Đơn hàng của tôi',    icon: <FaBoxOpen /> },
  { key: 'products',  label: 'Ebook đã mua',         icon: <FaBook /> },
  { key: 'reviews',   label: 'Đánh giá của tôi',    icon: <FaStar /> },
  { key: 'account',   label: 'Thông tin tài khoản', icon: <FaUser /> },
  { key: 'password',  label: 'Đổi mật khẩu',        icon: <FaLock /> },
  { key: 'support',   label: 'Hỗ trợ & khiếu nại', icon: <FaHeadset /> },
];

export default function UserDashboardPage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [partnerApp, setPartnerApp] = useState(null);
  const [pdfLoading, setPdfLoading] = useState({});

  // Account form state
  const [accountForm, setAccountForm] = useState({ name: '' });
  const [accountSaving, setAccountSaving] = useState(false);
  const [accountMsg, setAccountMsg] = useState(null); // { type: 'ok'|'err', text }

  // Password form state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);

  // Reviews state
  const [myReviews, setMyReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Support form
  const [supportForm, setSupportForm] = useState({ subject: '', message: '' });
  const [supportSent, setSupportSent] = useState(false);

  // Active coupons (for overview tab)
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/orders/my').then(r => setOrders(r.data)).finally(() => setLoading(false));
    api.get('/partner/application').then(r => setPartnerApp(r.data)).catch(() => {});
    api.get('/coupons/active').then(r => setActiveCoupons(r.data)).catch(() => {});
    setAccountForm({ name: user.name || '' });
  }, [user]);

  // Lazy load reviews khi click vào tab
  useEffect(() => {
    if (tab === 'reviews' && myReviews.length === 0) {
      setReviewsLoading(true);
      api.get('/users/my-reviews')
        .then(r => setMyReviews(r.data))
        .catch(() => {})
        .finally(() => setReviewsLoading(false));
    }
  }, [tab]);

  const handleLogout = () => { logout(); navigate('/'); };
  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const copyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDownloadPdf = async (ebookId) => {
    setPdfLoading(prev => ({ ...prev, [ebookId]: true }));
    try {
      const { data } = await api.get(`/ebooks/${ebookId}/pdf`);
      window.open(data.url, '_blank');
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể tải PDF');
    } finally {
      setPdfLoading(prev => ({ ...prev, [ebookId]: false }));
    }
  };

  const handleAccountSave = async (e) => {
    e.preventDefault();
    if (!accountForm.name.trim()) return setAccountMsg({ type: 'err', text: 'Tên không được để trống' });
    setAccountSaving(true); setAccountMsg(null);
    try {
      const { data } = await api.put('/users/me', { name: accountForm.name.trim() });
      updateUser({ name: data.name });
      setAccountMsg({ type: 'ok', text: 'Cập nhật thành công!' });
    } catch (err) {
      setAccountMsg({ type: 'err', text: err.response?.data?.message || 'Lỗi cập nhật' });
    } finally { setAccountSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm)
      return setPwMsg({ type: 'err', text: 'Mật khẩu xác nhận không khớp' });
    if (pwForm.newPassword.length < 6)
      return setPwMsg({ type: 'err', text: 'Mật khẩu mới phải ít nhất 6 ký tự' });
    setPwSaving(true); setPwMsg(null);
    try {
      const { data } = await api.put('/users/me/password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwMsg({ type: 'ok', text: data.message });
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setPwMsg({ type: 'err', text: err.response?.data?.message || 'Lỗi đổi mật khẩu' });
    } finally { setPwSaving(false); }
  };

  if (!user) return null;

  const totalSpent = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const memberLevel = totalSpent >= 3000000 ? 'Gold' : totalSpent >= 1800000 ? 'Silver' : 'Member';
  const nextLevel = 3000000;
  const progress = Math.min(100, Math.round(totalSpent / nextLevel * 100));

  // Collect unique purchased ebooks from all orders
  const purchasedMap = {};
  orders.forEach(order => {
    (order.items || []).forEach(item => {
      if (item.ebook && !purchasedMap[item.ebook]) {
        purchasedMap[item.ebook] = { ...item, orderId: order._id };
      }
    });
  });
  const purchasedEbooks = Object.values(purchasedMap);

  const isPartner = user?.role === 'partner';

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
              <button key={m.key} onClick={() => setTab(m.key)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', background: tab === m.key ? 'var(--primary-light)' : 'none', color: tab === m.key ? 'var(--primary)' : 'var(--text-dark)', fontWeight: tab === m.key ? 700 : 400, fontSize: 13, borderLeft: tab === m.key ? '3px solid var(--primary)' : '3px solid transparent', borderBottom: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                <span style={{ color: tab === m.key ? 'var(--primary)' : 'var(--text-gray)' }}>{m.icon}</span>
                {m.label}
              </button>
            ))}
            {/* Partner link */}
            <button onClick={() => isPartner ? navigate('/partner') : navigate('/partner/apply')}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', background: '#f0faf5', color: 'var(--primary)', fontWeight: 700, fontSize: 13, borderLeft: '3px solid transparent', borderBottom: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
              <FaStore style={{ color: 'var(--primary)' }} />
              {isPartner ? 'Quản lý Ebook' : 'Đăng ký Đối tác'}
            </button>
            <button onClick={handleLogout}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', color: '#ef4444', fontWeight: 600, fontSize: 13, cursor: 'pointer', background: 'none', fontFamily: 'inherit', textAlign: 'left' }}>
              <FaSignOutAlt /> Đăng xuất
            </button>
          </div>
        </div>

        {/* ===== MAIN CONTENT ===== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ===== OVERVIEW ===== */}
          {tab === 'overview' && (<>
            <div style={{ background: 'linear-gradient(135deg,#1B6B4A,#2a9d5c)', borderRadius: 12, padding: '24px 28px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Xin chào, {user.name} 👋</div>
                <div style={{ fontSize: 13, opacity: 0.85 }}>Chào mừng bạn quay trở lại với TravelGuide Hub</div>
              </div>
              <div style={{ fontSize: 72, opacity: 0.15, position: 'absolute', right: 24 }}>🧭</div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
              {[
                { icon: <FaShoppingBag size={22} color="var(--primary)" />, label: 'Đơn hàng', val: orders.length, action: () => setTab('orders'), sub: 'Xem lịch sử đơn', color: '#f0faf5' },
                { icon: <FaBook size={22} color="#2563eb" />, label: 'Ebook đã mua', val: purchasedEbooks.length, action: () => setTab('products'), sub: 'Xem thư viện', color: '#eff6ff' },
                { icon: <FaStar size={22} color="#f59e0b" />, label: 'Đánh giá đã viết', val: 0, action: () => setTab('reviews'), sub: 'Xem đánh giá', color: '#fffbeb' },
                { icon: <FaUser size={22} color="#7c3aed" />, label: 'Thông tin', val: '—', action: () => setTab('account'), sub: 'Chỉnh sửa hồ sơ', color: '#fdf4ff' },
              ].map((s, i) => (
                <div key={i} style={{ background: s.color, border: '1px solid var(--border)', borderRadius: 12, padding: '18px 16px', cursor: 'pointer' }} onClick={s.action}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-gray)', marginBottom: 2 }}>{s.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)', marginBottom: 8 }}>{s.val}</div>
                  <div style={{ fontSize: 12, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>{s.sub} <FaChevronRight size={9} /></div>
                </div>
              ))}
            </div>

            {/* ===== PROMO CARD ===== */}
            {activeCoupons.length > 0 && (
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <FaGift color="#e8a020" size={16} />
                  <span style={{ fontWeight: 700, fontSize: 15 }}>Ưu đãi dành riêng cho bạn</span>
                  <span style={{ fontSize: 12, color: 'var(--text-gray)', marginLeft: 4 }}>({activeCoupons.length} mã đang hoạt động)</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                  {activeCoupons.map(c => (
                    <div key={c._id} style={{ background: 'linear-gradient(135deg,#f0faf5,#e6f7ef)', border: '1.5px dashed #6ee7b7', borderRadius: 10, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 15, color: 'var(--primary)', letterSpacing: 1 }}>{c.code}</div>
                        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                          Giảm {c.type === 'percent' ? `${c.discount}%` : `${Number(c.discount).toLocaleString('vi-VN')}đ`}
                          {c.minOrder > 0 && ` · Đơn từ ${Number(c.minOrder).toLocaleString('vi-VN')}đ`}
                        </div>
                        {c.expiry && (
                          <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>
                            HSD: {new Date(c.expiry).toLocaleDateString('vi-VN')}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => copyCoupon(c.code)}
                        style={{ background: copiedCode === c.code ? 'var(--primary)' : 'white', color: copiedCode === c.code ? 'white' : 'var(--primary)', border: '1.5px solid var(--primary)', borderRadius: 6, fontSize: 11, fontWeight: 700, padding: '5px 10px', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}>
                        {copiedCode === c.code ? '✓ Đã copy' : 'Sao chép'}
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 10 }}>
                  💡 Nhập mã vào giỏ hàng khi thanh toán để nhận ưu đãi.
                </div>
              </div>
            )}

            {/* Recent orders */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Đơn hàng gần đây</div>
                  <button onClick={() => setTab('orders')} style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, background: 'none', cursor: 'pointer' }}>Xem tất cả</button>
                </div>
                {loading ? <div style={{ color: 'var(--text-gray)', fontSize: 13 }}>Đang tải...</div>
                  : orders.length === 0
                    ? <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-gray)', fontSize: 13 }}><FaShoppingBag size={28} style={{ marginBottom: 8, opacity: 0.3, display: 'block', margin: '0 auto 8px' }} />Chưa có đơn hàng nào</div>
                    : orders.slice(0, 5).map(order => (
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
              </div>

              {/* Membership */}
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Thành viên thân thiết</div>
                  <span style={{ background: '#f1f5f9', color: '#64748b', fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 12 }}>{memberLevel}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-gray)', marginBottom: 10 }}>
                  Bạn cần mua thêm <strong>{Math.max(0, nextLevel - totalSpent).toLocaleString('vi-VN')}đ</strong> để lên hạng Gold
                </div>
                <div style={{ height: 8, background: '#e5e7eb', borderRadius: 4, marginBottom: 6, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'linear-gradient(to right,var(--primary),#6ee7b7)', borderRadius: 4, width: `${progress}%`, transition: 'width 0.8s' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-gray)' }}>
                  <span>{totalSpent.toLocaleString('vi-VN')}đ</span>
                  <span>{nextLevel.toLocaleString('vi-VN')}đ</span>
                </div>
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { icon: <FaFileAlt size={14} color="var(--primary)" />, text: 'Tải PDF ngay sau khi mua' },
                    { icon: <FaSyncAlt size={14} color="#16a34a" />, text: 'Cập nhật nội dung miễn phí' },
                    { icon: <FaHeadset size={14} color="#7c3aed" />, text: 'Hỗ trợ 24/7' },
                  ].map((b, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: 'var(--text-gray)' }}>
                      {b.icon} {b.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>)}

          {/* ===== ORDERS TAB ===== */}
          {tab === 'orders' && (
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>
                Đơn hàng của tôi <span style={{ fontSize: 13, fontWeight: 400, color: '#6b7280' }}>({orders.length} đơn)</span>
              </h1>
              {loading ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-gray)' }}>Đang tải...</div>
              ) : orders.length === 0 ? (
                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: '60px 20px', textAlign: 'center' }}>
                  <FaShoppingBag size={40} style={{ opacity: 0.15, marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>Bạn chưa có đơn hàng nào</div>
                  <Link to="/" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 14 }}>Khám phá ebook ngay →</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {orders.map(order => (
                    <div key={order._id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
                      {/* Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                        <div>
                          <span style={{ fontFamily: 'monospace', fontSize: 12, background: '#f3f4f6', padding: '3px 8px', borderRadius: 4, fontWeight: 700 }}>
                            #{order._id.slice(-8).toUpperCase()}
                          </span>
                          <span style={{ fontSize: 12, color: 'var(--text-gray)', marginLeft: 10 }}>
                            {new Date(order.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FaCheckCircle size={10} /> Hoàn thành
                          </span>
                          <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--orange)' }}>{order.totalAmount?.toLocaleString('vi-VN')}đ</span>
                        </div>
                      </div>
                      {/* Items */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {(order.items || []).map((item, i) => (
                          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <div style={{ width: 52, height: 68, borderRadius: 6, background: 'linear-gradient(135deg,#1B6B4A,#2a9d5c)', flexShrink: 0, overflow: 'hidden' }}>
                              {item.thumbnail
                                ? <img src={item.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📖</div>}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{item.title || 'Guide du lịch'}</div>
                              <div style={{ fontSize: 12, color: 'var(--text-gray)' }}>Định dạng: PDF • Tải về không giới hạn</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: 6 }}>{item.price?.toLocaleString('vi-VN')}đ</div>
                              <button
                                onClick={() => handleDownloadPdf(item.ebook)}
                                disabled={pdfLoading[item.ebook]}
                                style={{ background: 'var(--primary)', color: 'white', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', opacity: pdfLoading[item.ebook] ? 0.7 : 1 }}>
                                <FaDownload size={10} />
                                {pdfLoading[item.ebook] ? 'Đang tải...' : 'Tải PDF'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== PRODUCTS TAB ===== */}
          {tab === 'products' && (
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>
                Ebook đã mua <span style={{ fontSize: 13, fontWeight: 400, color: '#6b7280' }}>({purchasedEbooks.length} ebook)</span>
              </h1>
              {purchasedEbooks.length === 0 ? (
                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: '60px 20px', textAlign: 'center' }}>
                  <FaBook size={40} style={{ opacity: 0.15, marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>Bạn chưa mua ebook nào</div>
                  <Link to="/" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 14 }}>Khám phá ebook ngay →</Link>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                  {purchasedEbooks.map((item, i) => (
                    <div key={i} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                      {/* Cover */}
                      <div style={{ height: 160, background: 'linear-gradient(135deg,#1B6B4A,#2a9d5c)', position: 'relative', overflow: 'hidden' }}>
                        {item.thumbnail
                          ? <img src={item.thumbnail} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>📖</div>}
                        <div style={{ position: 'absolute', top: 8, right: 8, background: '#dcfce7', color: '#16a34a', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <FaCheckCircle size={8} /> Đã mua
                        </div>
                      </div>
                      {/* Info */}
                      <div style={{ padding: '12px 14px 14px' }}>
                        <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.4, marginBottom: 10, height: 36, overflow: 'hidden' }}>{item.title}</div>
                        <div style={{ display: 'flex', gap: 6, flexDirection: 'column' }}>
                          <button
                            onClick={() => handleDownloadPdf(item.ebook)}
                            disabled={pdfLoading[item.ebook]}
                            style={{ width: '100%', background: 'var(--primary)', color: 'white', padding: '8px 0', borderRadius: 7, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', opacity: pdfLoading[item.ebook] ? 0.7 : 1 }}>
                            <FaDownload size={11} />
                            {pdfLoading[item.ebook] ? 'Đang tải...' : 'Tải PDF'}
                          </button>
                          <Link to={`/ebooks/${item.ebook}`}
                            style={{ width: '100%', background: '#f3f4f6', color: 'var(--text-dark)', padding: '7px 0', borderRadius: 7, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                            Xem chi tiết
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== ACCOUNT TAB ===== */}
          {tab === 'account' && (
            <div style={{ maxWidth: 560 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>Thông tin tài khoản</h1>
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: 28 }}>
                {/* Avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#1B6B4A,#2a9d5c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 800, color: 'white', flexShrink: 0 }}>
                    {user.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 17 }}>{user.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-gray)', marginTop: 2 }}>{user.email}</div>
                    <span style={{ background: '#f0faf5', color: 'var(--primary)', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, border: '1px solid var(--primary)', display: 'inline-block', marginTop: 6 }}>
                      {user.role === 'admin' ? '🛡️ Admin' : user.role === 'partner' ? '🤝 Đối tác' : '🏅 Thành viên'}
                    </span>
                  </div>
                </div>
                {/* Form */}
                <form onSubmit={handleAccountSave}>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Họ và tên</label>
                    <input
                      value={accountForm.name}
                      onChange={e => setAccountForm({ name: e.target.value })}
                      placeholder="Nhập tên của bạn"
                      style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
                    />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Email <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 400 }}>(không thể thay đổi)</span></label>
                    <input
                      value={user.email}
                      readOnly
                      style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, background: '#f9fafb', color: '#9ca3af', fontFamily: 'inherit' }}
                    />
                  </div>
                  {accountMsg && (
                    <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 8, background: accountMsg.type === 'ok' ? '#f0faf5' : '#fef2f2', color: accountMsg.type === 'ok' ? '#065f46' : '#991b1b', fontSize: 13, fontWeight: 600 }}>
                      {accountMsg.text}
                    </div>
                  )}
                  <button type="submit" disabled={accountSaving}
                    style={{ background: 'var(--primary)', color: 'white', padding: '11px 28px', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: accountSaving ? 0.7 : 1 }}>
                    {accountSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ===== PASSWORD TAB ===== */}
          {tab === 'password' && (
            <div style={{ maxWidth: 480 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>Đổi mật khẩu</h1>
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: 28 }}>
                {user.googleId && (
                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#92400e' }}>
                    ⚠️ Tài khoản đăng nhập bằng Google không sử dụng chức năng này.
                  </div>
                )}
                <form onSubmit={handlePasswordChange}>
                  {[
                    { label: 'Mật khẩu hiện tại', key: 'currentPassword', placeholder: 'Nhập mật khẩu cũ' },
                    { label: 'Mật khẩu mới', key: 'newPassword', placeholder: 'Tối thiểu 6 ký tự' },
                    { label: 'Xác nhận mật khẩu mới', key: 'confirm', placeholder: 'Nhập lại mật khẩu mới' },
                  ].map(f => (
                    <div key={f.key} style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{f.label}</label>
                      <input
                        type="password"
                        value={pwForm[f.key]}
                        onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        required
                        style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
                      />
                    </div>
                  ))}
                  {pwMsg && (
                    <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 8, background: pwMsg.type === 'ok' ? '#f0faf5' : '#fef2f2', color: pwMsg.type === 'ok' ? '#065f46' : '#991b1b', fontSize: 13, fontWeight: 600 }}>
                      {pwMsg.text}
                    </div>
                  )}
                  <button type="submit" disabled={pwSaving || !!user.googleId}
                    style={{ background: 'var(--primary)', color: 'white', padding: '11px 28px', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: pwSaving || user.googleId ? 'not-allowed' : 'pointer', opacity: pwSaving || user.googleId ? 0.6 : 1 }}>
                    {pwSaving ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ===== REVIEWS TAB ===== */}
          {tab === 'reviews' && (
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>
                Đánh giá của tôi
                <span style={{ fontSize: 13, fontWeight: 400, color: '#6b7280', marginLeft: 8 }}>({myReviews.length} đánh giá)</span>
              </h1>
              {reviewsLoading ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-gray)' }}>Đang tải...</div>
              ) : myReviews.length === 0 ? (
                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: '60px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>Bạn chưa viết đánh giá nào</div>
                  <div style={{ fontSize: 13, color: 'var(--text-gray)', marginBottom: 16 }}>Mua và sử dụng ebook để lại đánh giá nhé!</div>
                  <button onClick={() => navigate('/')} style={{ background: 'var(--primary)', color: 'white', padding: '10px 24px', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                    Khám phá ebook
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {myReviews.map((rv, i) => (
                    <div key={rv._id || i} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: 20, display: 'flex', gap: 16 }}>
                      {/* Ebook thumbnail */}
                      <div style={{ width: 56, height: 72, borderRadius: 8, background: 'linear-gradient(135deg,#1B6B4A,#2a9d5c)', flexShrink: 0, overflow: 'hidden' }}>
                        {rv.ebook?.thumbnail
                          ? <img src={rv.ebook.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📖</div>}
                      </div>
                      <div style={{ flex: 1 }}>
                        {/* Ebook title */}
                        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
                          {rv.ebook?.title || 'Ebook'}
                        </div>
                        {/* Stars */}
                        <div style={{ display: 'flex', gap: 2, marginBottom: 6 }}>
                          {[1, 2, 3, 4, 5].map(n => (
                            <FaStar key={n} size={14} color={n <= rv.rating ? '#f59e0b' : '#e5e7eb'} />
                          ))}
                          <span style={{ fontSize: 12, color: 'var(--text-gray)', marginLeft: 6 }}>{rv.rating}/5</span>
                        </div>
                        {/* Comment */}
                        {rv.comment && (
                          <div style={{ fontSize: 13, color: 'var(--text-dark)', lineHeight: 1.6, marginBottom: 6, background: '#f8fafb', borderRadius: 6, padding: '8px 12px' }}>
                            &ldquo;{rv.comment}&rdquo;
                          </div>
                        )}
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>
                          {new Date(rv.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </div>
                      </div>
                      {/* Link to ebook */}
                      <div style={{ flexShrink: 0 }}>
                        <Link to={`/ebooks/${rv.ebook?._id}`}
                          style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, background: '#f0faf5', padding: '6px 12px', borderRadius: 6, display: 'block', whiteSpace: 'nowrap' }}>
                          Xem ebook
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== SUPPORT TAB ===== */}
          {tab === 'support' && (
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>Hỗ trợ & Khiếu nại</h1>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

                {/* FAQ */}
                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
                  <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 18 }}> Câu hỏi thường gặp</div>
                  {[
                    { q: 'Tôi có thể tải PDF bao nhiêu lần?', a: 'Không giới hạn số lần tải sau khi đã mua. Bạn có thể tải bất cứ lúc nào từ trang “Ebook đã mua”.' },
                    { q: 'Tôi quên mật khẩu, phải làm sao?', a: 'Trên trang đăng nhập, nhấn “Quên mật khẩu”. Hệ thống sẽ gửi email đặt lại.' },
                    { q: 'Tôi có thể xem ebook trên điện thoại không?', a: 'Có, PDF có thể mở trên mọi thiết bị: điện thoại, máy tính bảng, laptop.' },
                    { q: 'Chính sách hoàn tiền như thế nào?', a: 'Hoàn 100% nếu liên hệ trong vòng 7 ngày kể từ ngày mua và chưa tải file PDF.' },
                    { q: 'Ebook có được cập nhật không?', a: 'Có, khi tác giả cập nhật nội dung, bạn sẽ được tải phiên bản mới miễn phí.' },
                  ].map((faq, i) => (
                    <details key={i} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 12 }}>
                      <summary style={{ fontWeight: 600, fontSize: 14, cursor: 'pointer', paddingBottom: 6, listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {faq.q} <FaChevronRight size={11} style={{ flexShrink: 0 }} />
                      </summary>
                      <div style={{ fontSize: 13, color: 'var(--text-gray)', lineHeight: 1.6, marginTop: 6 }}>{faq.a}</div>
                    </details>
                  ))}
                </div>

                {/* Contact form */}
                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
                  <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}> Gửi yêu cầu hỗ trợ</div>
                  <div style={{ fontSize: 13, color: 'var(--text-gray)', marginBottom: 18 }}>Thường phản hồi trong vòng 24 giờ</div>
                  {supportSent ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                      <div style={{ fontSize: 48, marginBottom: 12 }}></div>
                      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Gửi thành công!</div>
                      <div style={{ fontSize: 13, color: 'var(--text-gray)', marginBottom: 20 }}>Chúng tôi đã nhận được yêu cầu và sẽ phản hồi qua email {user.email}</div>
                      <button onClick={() => { setSupportSent(false); setSupportForm({ subject: '', message: '' }); }}
                        style={{ background: 'var(--primary)', color: 'white', padding: '10px 24px', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                        Gửi yêu cầu khác
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={e => {
                      e.preventDefault();
                      window.open(`mailto:support@travelguidehub.vn?subject=${encodeURIComponent(supportForm.subject)}&body=${encodeURIComponent(supportForm.message + '\n\n---\nTừ: ' + user.name + ' (' + user.email + ')')}`);
                      setSupportSent(true);
                    }}>
                      <div style={{ marginBottom: 14 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Tiêu đề</label>
                        <select value={supportForm.subject} onChange={e => setSupportForm(p => ({ ...p, subject: e.target.value }))} required
                          style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', background: 'white', fontFamily: 'inherit' }}>
                          <option value="">Chọn vấn đề...</option>
                          <option>Không tải được PDF</option>
                          <option>Yêu cầu hoàn tiền</option>
                          <option>Lỗi thanh toán</option>
                          <option>Báo cáo nội dung sai</option>
                          <option>Góp ý khác</option>
                        </select>
                      </div>
                      <div style={{ marginBottom: 18 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Nội dung</label>
                        <textarea value={supportForm.message} onChange={e => setSupportForm(p => ({ ...p, message: e.target.value }))} required
                          placeholder="Mô tả vấn đề bạn gặp phải..."
                          style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, minHeight: 120, resize: 'vertical', outline: 'none', fontFamily: 'inherit' }} />
                      </div>
                      <button type="submit"
                        style={{ background: 'var(--primary)', color: 'white', padding: '11px 28px', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                        Gửi yêu cầu
                      </button>
                    </form>
                  )}

                  {/* Contact info */}
                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-gray)', marginBottom: 8, fontWeight: 600 }}>HOẶC LIÊN HỆ TRỰC TIếP</div>
                    {[
                      { icon: '', text: 'support@travelguidehub.vn' },
                      { icon: '', text: 'Phản hồi trong 24 giờ (ngay cả cuối tuần)' },
                    ].map((c, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-gray)', alignItems: 'center', marginBottom: 5 }}>
                        <span>{c.icon}</span> {c.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </div>
  );
}
