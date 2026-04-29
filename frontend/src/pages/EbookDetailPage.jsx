import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { TopBar, Navbar, Footer, Spinner } from '../components/Layout';
import { FaStar, FaDownload, FaHeart, FaShieldAlt, FaUndo, FaHeadset, FaCheck, FaMapMarkerAlt, FaBook } from 'react-icons/fa';
import { BsFileText, BsCashCoin, BsMap, BsLightbulb } from 'react-icons/bs';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const FEATURES = [
  { icon: <BsFileText />, title: 'Lịch trình chi tiết từng ngày', desc: 'Gợi ý điểm tham quan, thời gian di chuyển, thời gian lý tưởng' },
  { icon: <BsCashCoin />, title: 'Ngân sách từ 3 – 5 triệu', desc: 'Bảng chi phí chi tiết: di chuyển, ăn uống, vé tham quan, lưu trú' },
  { icon: <BsMap />, title: 'Bản đồ & gợi ý ăn uống', desc: 'Google Maps, quán ngon, đặc sản không nên bỏ lỡ' },
  { icon: <BsLightbulb />, title: 'Mẹo & kinh nghiệm thực tế', desc: 'Mẹo tiết kiệm, lưu ý quan trọng, cách tránh những đác dễ gặp' },
];

const RECEIVES = ['File PDF chất lượng cao (~80 trang)', 'Có thể xem trên điện thoại, máy tính, tablet', 'Tải về ngay sau khi thanh toán', 'Cập nhật thông tin mới nhất 2024'];

const TABS = ['Mô tả sản phẩm', 'Nội dung chi tiết', 'Đánh giá', 'Câu hỏi thường gặp'];

export default function EbookDetailPage({ onAddToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ebook, setEbook] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.get(`/ebooks/${id}`), api.get('/ebooks')])
      .then(([r, all]) => { setEbook(r.data); setRelated(all.data.filter(e => e._id !== id).slice(0, 4)); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    setSubmitting(true);
    try {
      await api.post(`/ebooks/${id}/reviews`, review);
      const { data } = await api.get(`/ebooks/${id}`);
      setEbook(data); setReview({ rating: 5, comment: '' });
    } catch (err) { alert(err.response?.data?.message || 'Lỗi gửi đánh giá'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <><TopBar /><Navbar /><Spinner /><Footer /></>;
  if (!ebook) return <><TopBar /><Navbar /><div style={{ textAlign: 'center', padding: 80 }}>Không tìm thấy guide</div><Footer /></>;

  const discountPrice = Math.round(ebook.price * 1.39 / 1000) * 1000;
  const discount = Math.round((1 - ebook.price / discountPrice) * 100);

  return (
    <div>
      <TopBar cartCount={0} />
      <Navbar />

      {/* BREADCRUMB */}
      <div style={{ background: '#f8fafb', borderBottom: '1px solid var(--border)', padding: '10px 0', fontSize: 13 }}>
        <div className="container" style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--text-gray)' }}>
          <Link to="/" style={{ color: 'var(--primary)' }}>Trang chủ</Link> ›
          <span>Guide trong nước</span> ›
          <span>{ebook.location}</span> ›
          <span style={{ color: 'var(--text-dark)', fontWeight: 500 }}>{ebook.title}</span>
        </div>
      </div>

      <div className="container" style={{ padding: '28px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32, alignItems: 'flex-start' }}>

          {/* ===== LEFT ===== */}
          <div>
            {/* Top info */}
            <div style={{ display: 'flex', gap: 24, marginBottom: 28 }}>
              {/* Book cover */}
              <div style={{ width: 220, flexShrink: 0 }}>
                <div style={{ background: 'linear-gradient(135deg,#1B6B4A,#2a9d5c)', borderRadius: 12, height: 280, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', position: 'relative', marginBottom: 10 }}>
                  {(ebook.thumbnail || ebook.images?.[0]?.url) ? (
                    <img src={ebook.thumbnail || ebook.images[0].url} alt={ebook.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>🏖️</div>
                  )}
                  {ebook.badge === 'hot' && <span style={{ position: 'absolute', top: 10, left: 10, background: '#ef4444', color: 'white', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>HOT</span>}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {ebook.images?.length > 0 ? ebook.images.slice(0, 4).map((img, i) => (
                    <div key={i} style={{ width: 48, height: 48, borderRadius: 6, border: '1.5px solid var(--border)', overflow: 'hidden' }}>
                      <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )) : [1,2,3,4].map(i => (
                    <div key={i} style={{ width: 48, height: 48, background: 'var(--bg-light)', borderRadius: 6, border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏞️</div>
                  ))}
                  {ebook.images?.length > 4 && <div style={{ width: 48, height: 48, background: 'var(--primary)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 12 }}>+{ebook.images.length - 4}</div>}
                </div>
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>{ebook.title}</h1>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, fontSize: 13 }}>
                  <div style={{ display: 'flex', gap: 2, alignItems: 'center', color: '#f59e0b' }}>
                    {[1,2,3,4,5].map(i => <FaStar key={i} size={13} color={i <= Math.round(ebook.rating || 5) ? '#f59e0b' : '#e5e7eb'} />)}
                    <span style={{ color: 'var(--text-dark)', marginLeft: 4, fontWeight: 600 }}>{ebook.rating?.toFixed(1) || '5.0'}</span>
                    <span style={{ color: 'var(--text-gray)' }}>({ebook.numReviews || 0} đánh giá)</span>
                  </div>
                  <span style={{ color: 'var(--text-gray)' }}>|</span>
                  <span style={{ color: 'var(--text-gray)' }}>Đã bán {ebook.sales || 0}</span>
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-gray)', lineHeight: 1.7, marginBottom: 18 }}>{ebook.description}</p>

                {/* Features */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {FEATURES.map(f => (
                    <div key={f.title} style={{ display: 'flex', gap: 10, padding: '10px 12px', background: 'var(--bg-light)', borderRadius: 8 }}>
                      <span style={{ fontSize: 20, color: 'var(--primary)', flexShrink: 0, marginTop: 2 }}>{f.icon}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{f.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-gray)' }}>{f.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Receives */}
                <div style={{ background: '#f0faf5', border: '1px solid #c8e6d8', borderRadius: 8, padding: 14, marginTop: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Bạn sẽ nhận được gì:</div>
                  {RECEIVES.map(r => (
                    <div key={r} style={{ display: 'flex', gap: 8, fontSize: 13, marginBottom: 5, color: 'var(--text-dark)' }}>
                      <FaCheck color="var(--primary)" size={12} style={{ marginTop: 2, flexShrink: 0 }} /> {r}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* TABS */}
            <div style={{ borderBottom: '2px solid var(--border)', marginBottom: 24 }}>
              <div style={{ display: 'flex' }}>
                {TABS.map((t, i) => (
                  <button key={t} onClick={() => setTab(i)} style={{ padding: '12px 20px', fontSize: 14, fontWeight: 600, background: 'none', borderBottom: tab === i ? '2px solid var(--primary)' : '2px solid transparent', color: tab === i ? 'var(--primary)' : 'var(--text-gray)', marginBottom: -2 }}>
                    {t}{t === 'Đánh giá' && ` (${ebook.numReviews || 0})`}
                  </button>
                ))}
              </div>
            </div>

            {tab === 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 28 }}>
                <div>
                  <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Về cuốn guide này</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-gray)', lineHeight: 1.8, marginBottom: 16 }}>
                    Cuốn guide được biên soạn dựa trên trải nghiệm thực tế, giúp bạn có một chuyến đi hoàn hảo mà không cần lên kế hoạch quá nhiều.
                  </p>
                  {['Phù hợp cho: cặp đôi, nhóm bạn, gia đình','Phong cách: du lịch tự túc – tiết kiệm – trải nghiệm','Cập nhật thông tin mới nhất 2024','Định dạng: PDF','Số trang: ~80 trang'].map(p => (
                    <div key={p} style={{ display: 'flex', gap: 8, fontSize: 13, marginBottom: 8 }}>
                      <FaCheck color="var(--primary)" size={12} style={{ marginTop: 3, flexShrink: 0 }} /> {p}
                    </div>
                  ))}
                  <h3 style={{ fontWeight: 700, margin: '24px 0 16px' }}>Điểm nổi bật</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                    {[{i:<BsFileText/>,l:'Tiết kiệm thời gian',d:'Không cần tự tìm kiếm thông tin từ đầu'},{i:<BsCashCoin/>,l:'Tiết kiệm chi phí',d:'Lịch trình và ngân sách tối ưu nhất'},{i:<BsMap/>,l:'Trải nghiệm trọn vẹn',d:'Gợi ý điểm đẹp, ăn ngon, ít người biết'},{i:<BsLightbulb/>,l:'Dễ dàng sử dụng',d:'Thiết kế đẹp, rõ ràng, dễ đọc trên mọi thiết bị'}].map(f => (
                      <div key={f.l} style={{ textAlign: 'center', padding: 12, background: 'var(--bg-light)', borderRadius: 8 }}>
                        <div style={{ fontSize: 24, color: 'var(--primary)', marginBottom: 8 }}>{f.i}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{f.l}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-gray)' }}>{f.d}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ background: 'var(--bg-light)', borderRadius: 10, padding: 16, fontSize: 13 }}>
                    <div style={{ fontWeight: 700, marginBottom: 12 }}>Thông tin sản phẩm</div>
                    {[['Danh mục','Guide trong nước'],['Khu vực','Miền Trung'],['Thành phố',ebook.location],['Thời gian',ebook.duration||'4-5 ngày'],['Định dạng','PDF'],['Dung lượng','~40 MB'],['Cập nhật','05/2024'],['Ngôn ngữ','Tiếng Việt']].map(([k,v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ color: 'var(--text-gray)' }}>{k}</span>
                        <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 16, background: 'var(--bg-light)', borderRadius: 10, padding: 16 }}>
                    <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 13 }}>Tác giả</div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>T</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>TravelGuide Hub Team</div>
                        <div style={{ fontSize: 12, color: 'var(--text-gray)' }}>Đội ngũ mê du lịch và có nhiều năm kinh nghiệm khám phá Việt Nam.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === 2 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
                <div>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--primary)' }}>{ebook.rating?.toFixed(1) || '5.0'}</div>
                      <div style={{ display: 'flex', gap: 2, justifyContent: 'center', marginBottom: 4 }}>{[1,2,3,4,5].map(i => <FaStar key={i} color="#f59e0b" size={16} />)}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-gray)' }}>{ebook.numReviews || 0} đánh giá</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      {[5,4,3,2,1].map(n => {
                        const count = ebook.reviews?.filter(r => r.rating === n).length || (n === 5 ? 12 : n === 4 ? 3 : 1);
                        const total = ebook.reviews?.length || 16;
                        const pct = Math.round((count/total)*100);
                        return (
                          <div key={n} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                            <span style={{ fontSize: 12, width: 30 }}>{n} sao</span>
                            <div style={{ flex: 1, height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: '#f59e0b', borderRadius: 4 }} />
                            </div>
                            <span style={{ fontSize: 12, color: 'var(--text-gray)', width: 20 }}>{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {ebook.reviews?.map((r, i) => (
                    <div key={i} style={{ padding: '14px 0', borderTop: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{r.user?.name?.[0] || 'U'}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{r.user?.name || 'Người dùng'}</div>
                          <div style={{ display: 'flex', gap: 2 }}>{[1,2,3,4,5].map(i => <FaStar key={i} color={i <= r.rating ? '#f59e0b' : '#e5e7eb'} size={12} />)}</div>
                        </div>
                      </div>
                      {r.comment && <p style={{ fontSize: 13, color: 'var(--text-gray)', marginLeft: 46 }}>{r.comment}</p>}
                    </div>
                  ))}
                </div>
                <div>
                  {user ? (
                    <div style={{ background: 'var(--bg-light)', borderRadius: 10, padding: 20 }}>
                      <h4 style={{ fontWeight: 700, marginBottom: 16 }}>Viết đánh giá</h4>
                      <form onSubmit={handleReview}>
                        <select value={review.rating} onChange={e => setReview({...review, rating: Number(e.target.value)})} style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1.5px solid var(--border)', marginBottom: 12, fontSize: 14 }}>
                          {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} sao</option>)}
                        </select>
                        <textarea value={review.comment} onChange={e => setReview({...review, comment: e.target.value})} placeholder="Nhận xét của bạn..." style={{ width: '100%', padding: 12, borderRadius: 8, border: '1.5px solid var(--border)', minHeight: 100, fontSize: 14, resize: 'vertical', fontFamily: 'inherit', marginBottom: 12 }} />
                        <button type="submit" className="btn-primary-full" disabled={submitting}>{submitting ? 'Đang gửi...' : 'Gửi đánh giá'}</button>
                      </form>
                    </div>
                  ) : <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-gray)' }}>
                    <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Đăng nhập</Link> để viết đánh giá
                  </div>}
                </div>
              </div>
            )}
          </div>

          {/* ===== RIGHT — BUY BOX ===== */}
          <div style={{ position: 'sticky', top: 80 }}>
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: 20, boxShadow: 'var(--shadow-hover)' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'baseline', marginBottom: 8 }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--orange)' }}>{ebook.price?.toLocaleString('vi-VN')}đ</span>
                <span style={{ fontSize: 16, color: '#9ca3af', textDecoration: 'line-through' }}>{discountPrice.toLocaleString('vi-VN')}đ</span>
                <span style={{ background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700 }}>-{discount}%</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                {[<><FaDownload size={12} /> Tải về ngay sau khi thanh toán</>, <><FaBook size={12} /> Không giới hạn thiết bị</>, <><FaHeadset size={12} /> Hỗ trợ khách hàng 24/7</>].map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-gray)', alignItems: 'center' }}>{t}</div>
                ))}
              </div>
              <button className="btn-primary-full" style={{ marginBottom: 10, fontSize: 16, fontWeight: 800 }} onClick={() => { if (!user) navigate('/login'); else alert('Thanh toán thành công!'); }}>
                Mua ngay
              </button>
              <button className="btn-outline" style={{ width: '100%', marginBottom: 10, padding: 11 }} onClick={() => onAddToCart?.(ebook)}>
                Thêm vào giỏ hàng
              </button>
              <button onClick={() => setLiked(!liked)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 9, border: '1.5px solid var(--border)', borderRadius: 6, background: 'white', fontSize: 13, color: liked ? '#ef4444' : 'var(--text-gray)' }}>
                <FaHeart color={liked ? '#ef4444' : '#9ca3af'} /> Yêu thích
              </button>
              <div style={{ display: 'flex', gap: 8, margin: '14px 0', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--text-gray)' }}>Thanh toán:</span>
                {['VISA','MC','Momo','ZaloPay'].map(p => <span key={p} style={{ fontSize: 10, fontWeight: 800, background: 'var(--bg-light)', padding: '3px 8px', borderRadius: 4, border: '1px solid var(--border)' }}>{p}</span>)}
              </div>
              {[{i:<FaShieldAlt color="#2a9d5c"/>,t:'Thanh toán bảo mật',d:'Thông tin của bạn được bảo mật tuyệt đối'},{i:<FaUndo color="#2a9d5c"/>,t:'Hoàn 100%',d:'Nếu không hài lòng trong vòng 7 ngày'},{i:<FaHeadset color="#2a9d5c"/>,t:'Hỗ trợ nhanh chóng',d:'Đội ngũ hỗ trợ 24/7'}].map(t => (
                <div key={t.t} style={{ display: 'flex', gap: 10, padding: '10px 0', borderTop: '1px solid var(--border)', fontSize: 12 }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{t.i}</span>
                  <div><div style={{ fontWeight: 700 }}>{t.t}</div><div style={{ color: 'var(--text-gray)' }}>{t.d}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM: Sản phẩm liên quan + Đánh giá */}
        <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 40 }}>

          {/* CỘT TRÁI: SẢN PHẨM LIÊN QUAN — 4 card hàng ngang */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>Sản phẩm liên quan</h2>
              <Link to="/" style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 600 }}>Xem tất cả ›</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
              {related.map(eb => (
                <div key={eb._id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
                  onClick={() => navigate(`/ebooks/${eb._id}`)}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                  <div style={{ height: 120, background: 'linear-gradient(135deg,#1B6B4A,#2a9d5c)', position: 'relative' }}>
                    {eb.badge === 'best' && <span style={{ position: 'absolute', top: 8, left: 8, background: '#e8a020', color: 'white', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3 }}>BEST SELLER</span>}
                    {eb.badge === 'new' && <span style={{ position: 'absolute', top: 8, left: 8, background: 'var(--primary)', color: 'white', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3 }}>MỚI</span>}
                    {eb.badge === 'hot' && <span style={{ position: 'absolute', top: 8, left: 8, background: '#ef4444', color: 'white', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3 }}>HOT</span>}
                  </div>
                  <div style={{ padding: '10px 10px 12px' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.3, marginBottom: 4, height: 32, overflow: 'hidden' }}>{eb.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-gray)', marginBottom: 8 }}>Tự túc chi tiết</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--orange)' }}>{eb.price?.toLocaleString('vi-VN')}đ</span>
                      <button onClick={e => { e.stopPropagation(); onAddToCart?.(eb); }}
                        style={{ background: 'var(--primary)', color: 'white', width: 24, height: 24, borderRadius: 5, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CỘT PHẢI: ĐÁNH GIÁ — chỉ rating + bar chart */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>Đánh giá từ khách hàng</h2>
              <button onClick={() => setTab(2)} style={{ background: 'none', color: 'var(--primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Xem tất cả ›</button>
            </div>
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: '24px 20px', display: 'flex', gap: 20, alignItems: 'center' }}>
              {/* Điểm lớn */}
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: 56, fontWeight: 800, color: 'var(--text-dark)', lineHeight: 1 }}>{ebook.rating?.toFixed(1) || '4.8'}</div>
                <div style={{ fontSize: 13, color: 'var(--text-gray)', margin: '4px 0' }}>/5</div>
                <div style={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  {[1,2,3,4,5].map(i => <FaStar key={i} color="#f59e0b" size={14} />)}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-gray)', marginTop: 6 }}>({ebook.numReviews || 128} đánh giá)</div>
              </div>
              {/* Bar chart */}
              <div style={{ flex: 1 }}>
                {[{n:5,c:102},{n:4,c:20},{n:3,c:5},{n:2,c:1},{n:1,c:0}].map(({n,c}) => (
                  <div key={n} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 7 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-gray)', width: 32, textAlign: 'right', flexShrink: 0 }}>{n} sao</span>
                    <div style={{ flex: 1, height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${Math.round(c/128*100)}%`, height: '100%', background: '#f59e0b', borderRadius: 4 }} />
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-gray)', width: 24, flexShrink: 0 }}>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}
