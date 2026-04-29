import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar, Navbar, Footer, EbookCard, Spinner } from '../components/Layout';
import { FaMapMarkedAlt, FaGlobe, FaHeart, FaWallet, FaUserAlt, FaFire, FaMapMarkerAlt, FaPlane } from 'react-icons/fa';
import { BsFileText, BsArrowRepeat, BsCashCoin, BsDownload, BsHeadset, BsImage } from 'react-icons/bs';
import api from '../api/axios';

// ===== HƯỚNG DẪN ĐẶT ẢNH HERO =====
// Đặt 3 file ảnh vào thư mục: frontend/public/
// Tên file phải đúng như sau:
//   hero-dalat.jpg   → ảnh Đà Lạt
//   hero-danang.jpg  → ảnh Đà Nẵng
//   hero-hagiang.jpg → ảnh Hà Giang
// ======================================

const CATEGORIES = [
  { icon: <FaMapMarkedAlt />, label: 'Guide trong nước', sub: 'Khám phá Việt Nam', value: 'trong-nuoc' },
  { icon: <FaGlobe />, label: 'Guide nước ngoài', sub: 'Khám phá thế giới', value: 'nuoc-ngoai' },
  { icon: <FaHeart />, label: 'Guide cặp đôi', sub: 'Lãng mạn, chill', value: 'cap-doi' },
  { icon: <FaWallet />, label: 'Guide tiết kiệm', sub: 'Đi nhiều – tốn ít', value: 'tiet-kiem' },
  { icon: <FaUserAlt />, label: 'Solo trip', sub: 'Dành cho bạn', value: 'solo' },
];

const SAMPLE_EBOOKS = [
  { _id: 's1', title: 'Guide Đà Lạt 3N2Đ Tự túc chi tiết', price: 79000, location: 'Đà Lạt', badge: 'hot' },
  { _id: 's2', title: 'Guide Phú Quốc 4N3Đ Tự túc chi tiết', price: 89000, location: 'Phú Quốc', badge: 'new' },
  { _id: 's3', title: 'Guide Hội An 2N1Đ Tự túc chi tiết', price: 59000, location: 'Hội An', badge: '' },
  { _id: 's4', title: 'Guide Hà Giang 4N3Đ Tự túc chi tiết', price: 59000, location: 'Hà Giang', badge: 'best' },
  { _id: 's5', title: 'Guide Đà Nẵng 5N4Đ Tự túc chi tiết', price: 79000, location: 'Đà Nẵng', badge: 'hot' },
  { _id: 's6', title: 'Guide Bangkok 4N3Đ Tự túc chi tiết', price: 99000, location: 'Bangkok', badge: 'new' },
];

const TESTIMONIALS = [
  { name: 'Phan Trí Tâm', location: 'Hà Nội', stars: 5, text: '"Guide Đà Lạt rất chi tiết, lịch trình hợp lý, đi theo không cần nghĩ nhiều luôn!"' },
  { name: 'Nguyễn Hoàng Sơn', location: 'TP. HCM', stars: 5, text: '"Mua một lần mà dùng được cả năm. Rất đáng tiền!"' },
  { name: 'Trịnh Văn Liêm', location: 'Đà Nẵng', stars: 5, text: '"Thông tin cập nhật, dễ hiểu, phù hợp cho người mới đi du lịch tự túc như mình."' },
  { name: 'Sự Thị Yến Linh', location: 'Hải Phòng', stars: 5, text: '"Hướng dẫn từ A-Z, chuyến đi của mình rất trọn vẹn!"' },
];

export default function HomePage({ onAddToCart }) {
  const navigate = useNavigate();
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/ebooks').then(r => setEbooks(r.data)).catch(() => setEbooks([])).finally(() => setLoading(false));
  }, []);

  const displayBooks = ebooks.length > 0 ? ebooks : SAMPLE_EBOOKS;
  const domestic = displayBooks.filter(e => !['Bangkok', 'Singapore', 'Hàn Quốc', 'Nhật Bản', 'Thái Lan'].includes(e.location)).slice(0, 4);
  const international = displayBooks.filter(e => ['Bangkok', 'Singapore', 'Hàn Quốc', 'Nhật Bản', 'Thái Lan'].includes(e.location)).slice(0, 4);
  const fallbackIntl = [
    { _id: 'i1', title: 'Guide Singapore 4N3Đ', price: 99000, location: 'Singapore' },
    { _id: 'i2', title: 'Guide Hàn Quốc 5N4Đ', price: 129000, location: 'Hàn Quốc' },
    { _id: 'i3', title: 'Guide Nhật Bản 5N4Đ', price: 149000, location: 'Nhật Bản' },
    { _id: 'i4', title: 'Guide Thái Lan 4N3Đ', price: 99000, location: 'Thái Lan' },
  ];

  return (
    <div>
      <TopBar cartCount={0} />
      <Navbar />

      {/* HERO */}
      <section className="hero">
        <div className="inner">
          <div className="hero-left">
            <h1>Khám phá du lịch<br />dễ dàng hơn với<br /><span>những guide chi tiết</span></h1>
            <p>Ebook du lịch tự túc chi tiết – cập nhật – dễ hiểu<br />Mua một lần – dùng mãi mãi!</p>
            <button className="hero-btn" onClick={() => navigate('/ebooks')}>Khám phá ngay →</button>
          </div>
        </div>
      </section>

      {/* CATEGORY STRIP */}
      <div className="category-strip">
        <div className="inner">
          {CATEGORIES.map(c => (
            <div key={c.value} className="cat-item" onClick={() => navigate(`/ebooks?category=${c.value}`)}>
              <span className="cat-icon">{c.icon}</span>
              <div className="cat-text">
                <span className="cat-label">{c.label}</span>
                <span className="cat-sub">{c.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BESTSELLER */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title"><FaFire color="#f4821e" /> Guide bán chạy</h2>
            <a href="/ebooks" className="view-all">Xem tất cả →</a>
          </div>
          {loading ? <Spinner /> : (
            <div className="grid-6">
              {displayBooks.slice(0, 6).map(eb => (
                <EbookCard key={eb._id} ebook={eb} onBuy={onAddToCart} onClick={id => navigate(`/ebooks/${id}`)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* DOMESTIC + INTERNATIONAL */}
      <section className="section" style={{ background: 'var(--bg-light)' }}>
        <div className="container">
          <div className="two-col-section">
            <div>
              <div className="section-header">
                <h2 className="section-title"><FaMapMarkerAlt color="var(--primary)" /> Guide trong nước</h2>
                <a href="/ebooks" className="view-all">Xem tất cả</a>
              </div>
              <div className="grid-4">
                {(domestic.length > 0 ? domestic : displayBooks.slice(0, 4)).map(eb => (
                  <div key={eb._id} style={{ background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: 'var(--shadow)', cursor: 'pointer' }} onClick={() => navigate(`/ebooks/${eb._id}`)}>
                    <div style={{ height: 110, background: 'linear-gradient(135deg,#e8f5ef,#c8e6d8)', display:'flex', alignItems:'center', justifyContent:'center', fontSize: 32, color: 'var(--primary)' }}><BsImage /></div>
                    <div style={{ padding: '10px 12px' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, lineHeight: 1.3 }}>{eb.title}</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--orange)' }}>{eb.price?.toLocaleString('vi-VN')}đ</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="section-header">
                <h2 className="section-title"><FaGlobe color="var(--primary)" /> Guide quốc tế</h2>
                <a href="/ebooks" className="view-all">Xem tất cả</a>
              </div>
              <div className="grid-4">
                {(international.length > 0 ? international : fallbackIntl).map(eb => (
                  <div key={eb._id} style={{ background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: 'var(--shadow)', cursor: 'pointer' }} onClick={() => navigate(`/ebooks/${eb._id}`)}>
                    <div style={{ height: 110, background: 'linear-gradient(135deg,#e8eeff,#c8d6f0)', display:'flex', alignItems:'center', justifyContent:'center', fontSize: 32, color: '#2a5c8a' }}><FaPlane /></div>
                    <div style={{ padding: '10px 12px' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, lineHeight: 1.3 }}>{eb.title}</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--orange)' }}>{eb.price?.toLocaleString('vi-VN')}đ</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <div className="why-us">
        <div className="container">
          <h2 className="why-us-title">TẠI SAO CHỌN TRAVELGUIDE HUB?</h2>
          <div className="why-grid">
            {[
              { icon: <BsFileText />, label: 'Nội dung chi tiết', desc: 'Lịch trình, bản đồ, chi phí được tổng hợp kỹ lưỡng' },
              { icon: <BsArrowRepeat />, label: 'Cập nhật liên tục', desc: 'Thông tin mới nhất về giá cả, địa điểm, kinh nghiệm' },
              { icon: <BsCashCoin />, label: 'Tiết kiệm chi phí', desc: 'Đi nhiều không sợ tốn kém' },
              { icon: <BsDownload />, label: 'Mua là đọc ngay', desc: 'Thanh toán nhanh – Tải về đọc ngay' },
              { icon: <BsHeadset />, label: 'Hỗ trợ tận tâm', desc: 'Giải đáp thắc mắc trước và sau khi mua' },
            ].map(f => (
              <div key={f.label} className="why-item">
                <div className="why-icon" style={{ fontSize: 28, color: 'var(--primary)' }}>{f.icon}</div>
                <div className="why-text">
                  <div className="why-label">{f.label}</div>
                  <div className="why-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div className="testimonials">
        <div className="container">
          <h2 className="testi-title">KHÁCH HÀNG NÓI GÌ VỀ CHÚNG TÔI?</h2>
          <div className="testi-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testi-card">
                <div className="testi-header">
                  <div className="testi-avatar">{t.name[0]}</div>
                  <div>
                    <div className="testi-name">{t.name}</div>
                    <div className="testi-location">{t.location}</div>
                  </div>
                </div>
                <div className="testi-stars">{'⭐'.repeat(t.stars)}</div>
                <p className="testi-text">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
