import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TopBar, Navbar, Footer, Spinner } from '../components/Layout';
import { FaSearch, FaStar, FaMapMarkerAlt, FaSlidersH, FaShoppingCart, FaChevronDown, FaChevronUp, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import api from '../api/axios';



const FILTERS = [
  { key: 'danh-muc', label: 'Danh mục', options: ['Tất cả danh mục','Guide trong nước','Guide nước ngoài','Guide cặp đôi','Guide tiết kiệm','Solo trip'] },
  { key: 'khu-vuc', label: 'Khu vực trong nước', options: ['Tất cả khu vực','Miền Bắc','Miền Trung','Miền Nam','Tây Nguyên','Đảo & Biển'] },
  { key: 'so-ngay', label: 'Số ngày', options: ['Tất cả','1 – 2 ngày','3 – 4 ngày','5 – 7 ngày','Trên 7 ngày'] },
  { key: 'dinh-dang', label: 'Định dạng', options: ['PDF','Ebook (PDF + Map)','PDF + Excel chi phí'] },
];

const PAGE_SIZE = 12;

export default function ExplorePage({ onAddToCart }) {
  const navigate = useNavigate();
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const [collapsed, setCollapsed] = useState({});
  const [selected, setSelected] = useState({});
  const [budget, setBudget] = useState(10000000);
  const [email, setEmail] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get('/ebooks').then(r => setEbooks(r.data)).catch(() => setEbooks([])).finally(() => setLoading(false));
  }, []);

  const toggleCollapse = (key) => setCollapsed(c => ({ ...c, [key]: !c[key] }));
  const setFilter = (key, val) => setSelected(s => ({ ...s, [key]: val }));

  // Client-side filter + sort
  let filtered = [...ebooks];
  if (keyword) filtered = filtered.filter(e => e.title?.toLowerCase().includes(keyword.toLowerCase()) || e.location?.toLowerCase().includes(keyword.toLowerCase()));
  if (budget < 10000000) filtered = filtered.filter(e => e.price <= budget);
  if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
  else if (sort === 'rating') filtered.sort((a, b) => (b.rating || 5) - (a.rating || 5));
  else filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <TopBar />
      <Navbar />

      {/* BREADCRUMB */}
      <div style={{ background: '#f8fafb', borderBottom: '1px solid var(--border)', padding: '9px 0', fontSize: 13 }}>
        <div className="container" style={{ display: 'flex', gap: 6, color: 'var(--text-gray)', alignItems: 'center' }}>
          <span style={{ fontSize: 12 }}></span>
          <Link to="/" style={{ color: 'var(--primary)' }}>Trang chủ</Link> ›
          <span>Khám phá</span>
        </div>
      </div>

      {/* BANNER ẢNH NỀN */}
      <div style={{
        position: 'relative',
        height: 260,
        backgroundImage: 'url(/explore-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        overflow: 'hidden',
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: 'white', marginBottom: 8, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>Khám phá guide du lịch</h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.88)', marginBottom: 20, textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>Tìm và chọn guide phù hợp cho hành trình của bạn</p>
          {/* Search bar trong banner */}
          <form onSubmit={e => { e.preventDefault(); setPage(1); }} style={{ display: 'flex', maxWidth: 500 }}>
            <input value={keyword} onChange={e => setKeyword(e.target.value)}
              placeholder="Tìm điểm đến, tên guide..."
              style={{ flex: 1, padding: '12px 16px', border: 'none', borderRadius: '8px 0 0 8px', fontSize: 14, outline: 'none' }} />
            <button type="submit" style={{ padding: '12px 22px', background: '#e8a020', color: 'white', borderRadius: '0 8px 8px 0', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <FaSearch size={13} /> Tìm kiếm
            </button>
          </form>
        </div>
      </div>

      <div className="container" style={{ padding: '24px 20px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24, alignItems: 'flex-start' }}>

          {/* ===== SIDEBAR ===== */}
          <div style={{ position: 'sticky', top: 80 }}>
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 10 }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FaSlidersH size={13} color="var(--primary)" /> BỘ LỌC TÌM KIẾM
                </div>
                <button onClick={() => { setSelected({}); setBudget(10000000); setKeyword(''); }}
                  style={{ fontSize: 12, color: '#ef4444', fontWeight: 600, background: 'none', cursor: 'pointer' }}>Xóa tất cả</button>
              </div>

              {/* Search inside sidebar */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: 0, border: '1.5px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
                  <input value={keyword} onChange={e => setKeyword(e.target.value)}
                    placeholder="Tìm kiếm guide..."
                    style={{ flex: 1, padding: '8px 10px', border: 'none', fontSize: 13, outline: 'none' }} />
                  <button onClick={() => setPage(1)} style={{ padding: '0 12px', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer' }}>
                    <FaSearch size={12} />
                  </button>
                </div>
              </div>

              {/* Collapsible filter sections */}
              {FILTERS.map(f => (
                <div key={f.key} style={{ borderBottom: '1px solid var(--border)' }}>
                  <button onClick={() => toggleCollapse(f.key)}
                    style={{ width: '100%', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                    {f.label}
                    {collapsed[f.key] ? <FaChevronDown size={11} /> : <FaChevronUp size={11} />}
                  </button>
                  {!collapsed[f.key] && (
                    <div style={{ padding: '4px 16px 12px' }}>
                      {f.options.map(opt => (
                        <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', cursor: 'pointer', fontSize: 13 }}>
                          <input type="radio" name={f.key} checked={(selected[f.key] || f.options[0]) === opt}
                            onChange={() => setFilter(f.key, opt)} style={{ accentColor: 'var(--primary)' }} />
                          <span style={{ color: (selected[f.key] || f.options[0]) === opt ? 'var(--primary)' : 'var(--text-dark)', fontWeight: (selected[f.key] || f.options[0]) === opt ? 700 : 400 }}>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Budget slider */}
              <div style={{ borderBottom: '1px solid var(--border)' }}>
                <button onClick={() => toggleCollapse('budget')}
                  style={{ width: '100%', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                  Ngân sách {collapsed['budget'] ? <FaChevronDown size={11} /> : <FaChevronUp size={11} />}
                </button>
                {!collapsed['budget'] && (
                  <div style={{ padding: '4px 16px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-gray)', marginBottom: 8 }}>
                      <span>Từ 0đ</span><span>Đến {(budget/1000).toFixed(0)}k đ</span>
                    </div>
                    <input type="range" min="0" max="10000000" step="10000" value={budget}
                      onChange={e => setBudget(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--primary)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-gray)', marginTop: 4 }}>
                      <span>0đ</span><span>10,000,000đ+</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Apply button */}
              <div style={{ padding: 16 }}>
                <button onClick={() => setPage(1)}
                  style={{ width: '100%', padding: '11px 0', background: 'var(--primary)', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  Áp dụng bộ lọc
                </button>
              </div>
            </div>
          </div>

          {/* ===== MAIN GRID ===== */}
          <div>
            {/* Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: 'var(--text-gray)' }}>
                Hiện thị <strong>{(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, filtered.length)}</strong> của <strong>{filtered.length}</strong> guide
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--text-gray)' }}>Sắp xếp:</span>
                <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
                  style={{ padding: '7px 12px', border: '1.5px solid var(--border)', borderRadius: 6, fontSize: 13, outline: 'none', background: 'white' }}>
                  <option value="">Mới nhất</option>
                  <option value="price-asc">Giá tăng dần</option>
                  <option value="price-desc">Giá giảm dần</option>
                  <option value="rating">Đánh giá cao nhất</option>
                </select>
              </div>
            </div>

            {loading ? <Spinner /> : paged.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-gray)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                <p style={{ fontSize: 16 }}>Không tìm thấy guide nào phù hợp</p>
                <button onClick={() => { setKeyword(''); setBudget(10000000); setSelected({}); }}
                  style={{ marginTop: 14, padding: '10px 24px', background: 'var(--primary)', color: 'white', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Xóa bộ lọc</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                {paged.map((eb) => {
                  const discountPrice = Math.round(eb.price * 1.32 / 1000) * 1000;
                  const badgeColors = { hot: '#ef4444', new: 'var(--primary)', best: '#e8a020' };
                  const badgeLabels = { hot: 'HOT', new: 'MỚI', best: 'BEST SELLER' };
                  return (
                    <div key={eb._id}
                      style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                      onClick={() => navigate(`/ebooks/${eb._id}`)}>
                      {/* Thumbnail */}
                      <div style={{ position: 'relative', height: 150, overflow: 'hidden', background: 'linear-gradient(135deg,#1B6B4A 0%,#2a9d5c 60%,#38b2ac 100%)' }}>
                        {(eb.thumbnail || eb.images?.[0]?.url) ? (
                          <img src={eb.thumbnail || eb.images[0].url} alt={eb.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, opacity: 0.25 }}>🧭</div>
                        )}
                        {eb.badge && <span style={{ position: 'absolute', top: 8, left: 8, background: badgeColors[eb.badge] || '#e8a020', color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4 }}>{badgeLabels[eb.badge] || eb.badge}</span>}
                        <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.35)', color: 'white', fontSize: 11, padding: '2px 8px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <FaMapMarkerAlt size={9} /> {eb.location}
                        </div>
                      </div>
                      <div style={{ padding: '12px 12px 14px' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.4, marginBottom: 4, height: 36, overflow: 'hidden' }}>{eb.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-gray)', marginBottom: 3 }}>Tự túc chi tiết</div>
                        {eb.duration && <div style={{ fontSize: 12, color: 'var(--text-gray)', marginBottom: 3 }}>📅 {eb.duration}</div>}
                        <div style={{ fontSize: 12, color: 'var(--text-gray)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <FaMapMarkerAlt size={10} color="var(--primary)" /> {eb.location}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                          {[1,2,3,4,5].map(i => <FaStar key={i} size={11} color={i <= Math.round(eb.rating || 5) ? '#f59e0b' : '#e5e7eb'} />)}
                          <span style={{ fontSize: 11, color: 'var(--text-gray)' }}>({eb.numReviews || 0})</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--orange)' }}>{eb.price?.toLocaleString('vi-VN')}đ</div>
                            <div style={{ fontSize: 11, color: '#9ca3af', textDecoration: 'line-through' }}>{discountPrice.toLocaleString('vi-VN')}đ</div>
                          </div>
                          <button onClick={e => { e.stopPropagation(); onAddToCart?.(eb); }}
                            style={{ background: 'var(--primary)', color: 'white', width: 32, height: 32, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FaShoppingCart size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 32 }}>
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                  style={{ width: 34, height: 34, borderRadius: 6, border: '1.5px solid var(--border)', background: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: page === 1 ? '#9ca3af' : 'var(--text-dark)' }}>
                  <FaChevronLeft size={11} />
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const n = i + 1;
                  return (
                    <button key={n} onClick={() => setPage(n)}
                      style={{ width: 34, height: 34, borderRadius: 6, border: `1.5px solid ${page === n ? 'var(--primary)' : 'var(--border)'}`, background: page === n ? 'var(--primary)' : 'white', color: page === n ? 'white' : 'var(--text-dark)', fontWeight: page === n ? 700 : 400, fontSize: 14, cursor: 'pointer' }}>
                      {n}
                    </button>
                  );
                })}
                {totalPages > 7 && <span style={{ lineHeight: '34px', color: 'var(--text-gray)' }}>...</span>}
                <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
                  style={{ width: 34, height: 34, borderRadius: 6, border: '1.5px solid var(--border)', background: 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: page === totalPages ? '#9ca3af' : 'var(--text-dark)' }}>
                  <FaChevronRight size={11} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* NEWSLETTER */}
        <div style={{ marginTop: 48, background: 'linear-gradient(135deg,#1B6B4A,#2a9d5c)', borderRadius: 14, padding: '32px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24 }}>
          <div style={{ color: 'white' }}>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Nhận guide mới và ưu đãi hấp dẫn!</div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>Đăng ký email để không bỏ lỡ guide mới và chương trình khuyến mãi</div>
          </div>
          <div style={{ display: 'flex', gap: 0, flexShrink: 0 }}>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Nhập email của bạn..."
              style={{ padding: '11px 16px', borderRadius: '8px 0 0 8px', border: 'none', fontSize: 14, width: 240, outline: 'none' }} />
            <button style={{ padding: '11px 20px', background: '#e8a020', color: 'white', borderRadius: '0 8px 8px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Đăng ký</button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
