import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiSearch, FiPhone, FiLogOut, FiSettings } from 'react-icons/fi';
import { FaFacebook, FaInstagram, FaTiktok, FaYoutube, FaCompass } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

/* ========== TOP BAR ========== */
export const TopBar = ({ cartCount = 0 }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="top-bar">
      <div className="inner">
        <div className="top-bar-left">
          <FiPhone size={13} /> Hotline: 1900 1177
        </div>
        <div className="top-bar-search">
          <FiSearch size={14} color="rgba(255,255,255,0.6)" />
          <input placeholder="Tìm guide du lịch bạn cần..." />
        </div>
        <div className="top-bar-right">
          {user ? (
            <>
              {user.role === 'admin' && (
                <button className="btn-login" onClick={() => navigate('/admin')}>
                  <FiSettings size={13} /> Admin
                </button>
              )}
              {user.role === 'partner' && (
                <button className="btn-login" onClick={() => navigate('/partner')}
                  style={{ background: 'rgba(46,213,115,0.15)', border: '1px solid rgba(46,213,115,0.4)', color: '#6ee7b7' }}>
                  🤝 Partner
                </button>
              )}
              {/* User avatar button -> profile */}
              <button className="btn-login" onClick={() => navigate('/profile')}
                style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'white', flexShrink: 0 }}>
                  {user.name?.charAt(0)?.toUpperCase()}
                </span>
                {user.name?.split(' ').pop()}
              </button>
              <button className="btn-login" onClick={logout}><FiLogOut size={13} /> Đăng xuất</button>
            </>
          ) : (
            <>
              <button className="btn-login" onClick={() => navigate('/login')}><FiUser size={13} /> Đăng nhập</button>
              <button className="btn-register" onClick={() => navigate('/login')}>Đăng ký</button>
            </>
          )}
          <button className="btn-cart" onClick={() => navigate('/cart')}>
            <FiShoppingCart size={14} /> Giỏ hàng
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ========== NAVBAR ========== */
export const Navbar = () => (
  <nav className="navbar">
    <div className="inner">
      <Link to="/" className="logo">
        <div className="logo-icon"><FaCompass color="white" size={20} /></div>
        <span className="logo-text">TravelGuide Hub</span>
      </Link>
      <ul className="nav-links">
        {[
          { to: '/', label: 'Trang chủ' },
          { to: '/explore', label: 'Khám phá' },
          { to: '/explore?category=combo', label: 'Combo guide' },
          { to: '#blog', label: 'Blog du lịch' },
          { to: '#guide', label: 'Hướng dẫn' },
          { to: '#contact', label: 'Liên hệ' },
        ].map(({ to, label }) => (
          <li key={label}>
            <Link to={to} className={location.pathname === to ? 'active' : ''}>{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  </nav>
);

/* ========== FOOTER ========== */
export const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-grid">
        <div>
          <div className="footer-logo"><FaCompass color="#6ee7b7" /> TravelGuide Hub</div>
          <p className="footer-desc">Nền tảng cung cấp ebook guide du lịch tự túc chi tiết, cập nhật và dễ hiểu.<br />Mua một lần – Đồng hành trọn hành trình!</p>
          <div className="social-links">
            {[FaFacebook, FaInstagram, FaTiktok, FaYoutube].map((Icon, i) => (
              <a key={i} href="#"><Icon /></a>
            ))}
          </div>
        </div>
        <div>
          <h4>Về chúng tôi</h4>
          <ul>
            {['Giới thiệu', 'Hướng dẫn sử dụng', 'Điều khoản sử dụng', 'Chính sách bảo mật'].map(t => (
              <li key={t}><a href="#">{t}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Hỗ trợ</h4>
          <ul>
            {['Câu hỏi thường gặp', 'Hướng dẫn thanh toán', 'Chính sách hoàn tiền', 'Liên hệ hỗ trợ'].map(t => (
              <li key={t}><a href="#">{t}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Liên hệ</h4>
          <ul style={{ marginBottom: 16 }}>
            <li style={{ color: 'rgba(255,255,255,0.65)' }}>✉ support@travelguidehub.com</li>
            <li style={{ color: 'rgba(255,255,255,0.65)' }}>📞 1900 1177</li>
            <li style={{ color: 'rgba(255,255,255,0.65)' }}>🕐 8:00 – 22:00 (T2 – CN)</li>
          </ul>
          <h4>Đăng ký nhận tin</h4>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 8 }}>Nhận thông tin guide mới và ưu đãi hấp dẫn!</p>
          <div className="newsletter-row">
            <input placeholder="Nhập email của bạn..." />
            <button>➤</button>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2025 TravelGuide Hub. All rights reserved.</span>
        <div className="payment-icons">
          {[['VISA','#1a1f71'],['MC','#eb001b'],['momo','#a50064'],['ZaloPay','#0068ff']].map(([l, c]) => (
            <span key={l} className="pay-badge" style={{ color: c }}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

/* ========== EBOOK CARD ========== */
export const EbookCard = ({ ebook, onBuy, onClick }) => {
  const badges = { hot: 'HOT', new: 'MỚI', best: 'BEST SELLER' };
  const thumb = ebook.thumbnail || (ebook.images?.[0]?.url);
  return (
    <div className="ebook-card" onClick={() => onClick?.(ebook._id)}>
      <div className="ebook-thumb-placeholder" style={thumb ? { padding: 0, background: 'none' } : {}}>
        {thumb ? (
          <img src={thumb} alt={ebook.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px 12px 0 0', display: 'block' }} />
        ) : (
          <>
            <div style={{ fontSize: 36, opacity: 0.4 }}>🗺️</div>
            <div style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}>{ebook.location || 'Việt Nam'}</div>
          </>
        )}
        {ebook.badge && (
          <span className={`ebook-badge ${ebook.badge}`}>{badges[ebook.badge] || 'HOT'}</span>
        )}
      </div>
      <div className="ebook-body">
        <div className="ebook-title">{ebook.title}</div>
        <ul className="ebook-features">
          <li>Lịch trình chi tiết từng ngày</li>
          <li>Ngân sách: {ebook.price < 60000 ? '1-2 triệu' : ebook.price < 80000 ? '2-3 triệu' : '3-5 triệu'}</li>
          {ebook.location && <li>Địa điểm: {ebook.location}</li>}
        </ul>
        <div className="ebook-footer">
          <div className="ebook-price">{ebook.price?.toLocaleString('vi-VN')}đ</div>
          <button className="btn-buy" onClick={e => { e.stopPropagation(); onBuy?.(ebook); }}>Mua ngay</button>
        </div>
      </div>
    </div>
  );
};

/* ========== SPINNER ========== */
export const Spinner = () => (
  <div style={{ textAlign: 'center', padding: 60 }}>
    <div style={{ width: 40, height: 40, border: '4px solid var(--primary-light)', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);
