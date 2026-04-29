import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TopBar, Navbar, Footer } from '../components/Layout';
import { FaShoppingCart, FaTrash, FaHeart, FaShoppingBag, FaShieldAlt, FaUndo, FaHeadset, FaCheck, FaArrowLeft, FaDownload, FaFileAlt, FaSyncAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function CartPage({ cart, setCart, removeFromCart }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState({});

  useEffect(() => {
    api.get('/ebooks').then(r => setRelated(r.data.slice(0, 6))).catch(() => {});
    const initQty = {};
    cart.forEach(item => { initQty[item._id] = 1; });
    setQty(initQty);
  }, []);

  const removeItem = (id) => removeFromCart ? removeFromCart(id) : setCart(cart.filter(item => item._id !== id));
  const clearCart = () => { if (confirm('Xoá tất cả sản phẩm?')) setCart([]); };
  const subtotal = cart.reduce((sum, item) => sum + item.price * (qty[item._id] || 1), 0);
  const total = subtotal - discount;

  const applyCoupon = () => {
    if (coupon.toUpperCase() === 'TRAVEL10') { setDiscount(Math.round(subtotal * 0.1)); alert('Áp dụng mã giảm 10% thành công!'); }
    else alert('Mã giảm giá không hợp lệ');
  };

  const handleCheckout = () => {
    if (!user) return navigate('/login');
    navigate('/checkout');
  };

  return (
    <div>
      <TopBar />
      <Navbar />

      {/* BREADCRUMB */}
      <div style={{ background: '#f8fafb', borderBottom: '1px solid var(--border)', padding: '10px 0', fontSize: 13 }}>
        <div className="container" style={{ display: 'flex', gap: 6, color: 'var(--text-gray)' }}>
          <Link to="/" style={{ color: 'var(--primary)' }}>Trang chủ</Link> ›
          <span>Giỏ hàng</span>
        </div>
      </div>

      <div className="container" style={{ padding: '28px 20px 48px' }}>

        {/* TITLE + STEPS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>
              Giỏ hàng của bạn <span style={{ color: 'var(--primary)' }}>({cart.length})</span>
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-gray)' }}>Kiểm tra lại sản phẩm và tiến hành thanh toán</p>
          </div>
          {/* Progress steps */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {[{ n: 1, icon: <FaShoppingCart />, label: 'Giỏ hàng', active: true },
              { n: 2, label: 'Thanh toán', active: false },
              { n: 3, label: 'Hoàn tất', active: false }
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: step.active ? 'var(--primary)' : '#e5e7eb', color: step.active ? 'white' : '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, margin: '0 auto 4px' }}>
                    {step.icon || step.n}
                  </div>
                  <div style={{ fontSize: 11, color: step.active ? 'var(--primary)' : '#9ca3af', fontWeight: step.active ? 700 : 400 }}>{step.label}</div>
                </div>
                {i < 2 && <div style={{ width: 60, height: 2, background: '#e5e7eb', margin: '0 4px 18px' }} />}
              </div>
            ))}
          </div>
        </div>

        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 64, color: 'var(--primary)', marginBottom: 16 }}><FaShoppingBag /></div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Giỏ hàng trống</h3>
            <p style={{ color: 'var(--text-gray)', marginBottom: 24 }}>Bạn chưa thêm guide nào vào giỏ</p>
            <button className="btn-primary" style={{ padding: '12px 32px' }} onClick={() => navigate('/')}>Khám phá guide ngay</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 28, alignItems: 'flex-start' }}>

            {/* ===== CART TABLE ===== */}
            <div>
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                {/* Table header */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 130px 110px 40px', gap: 0, padding: '12px 20px', background: 'var(--bg-light)', borderBottom: '1px solid var(--border)', fontSize: 13, fontWeight: 600, color: 'var(--text-gray)' }}>
                  <span>Sản phẩm</span><span style={{ textAlign: 'center' }}>Đơn giá</span><span style={{ textAlign: 'center' }}>Số lượng</span><span style={{ textAlign: 'center' }}>Thành tiền</span><span />
                </div>

                {/* Cart rows */}
                {cart.map(item => (
                  <div key={item._id} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 130px 110px 40px', gap: 0, padding: '16px 20px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                    {/* Product */}
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg,#1B6B4A,#2a9d5c)', borderRadius: 8, flexShrink: 0, cursor: 'pointer', overflow: 'hidden' }}
                        onClick={() => navigate(`/ebooks/${item._id}`)}>
                        {(item.thumbnail || item.images?.[0]?.url) && (
                          <img src={item.thumbnail || item.images[0].url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, lineHeight: 1.3, cursor: 'pointer' }} onClick={() => navigate(`/ebooks/${item._id}`)}>{item.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-gray)', marginBottom: 4 }}>• Ebook PDF</div>
                        <div style={{ fontSize: 12, color: 'var(--text-gray)', marginBottom: 6 }}>• File đính kèm: Bản đồ, bảng chi phí</div>
                        <button style={{ fontSize: 12, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4, background: 'none' }}>
                          <FaHeart size={10} /> Yêu thích
                        </button>
                      </div>
                    </div>
                    {/* Unit price */}
                    <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 600 }}>{item.price?.toLocaleString('vi-VN')}đ</div>
                    {/* Quantity */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
                      <button onClick={() => setQty(q => ({ ...q, [item._id]: Math.max(1, (q[item._id] || 1) - 1) }))}
                        style={{ width: 28, height: 28, border: '1px solid var(--border)', borderRadius: '4px 0 0 4px', background: 'white', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                      <div style={{ width: 36, height: 28, border: '1px solid var(--border)', borderLeft: 'none', borderRight: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600 }}>{qty[item._id] || 1}</div>
                      <button onClick={() => setQty(q => ({ ...q, [item._id]: (q[item._id] || 1) + 1 }))}
                        style={{ width: 28, height: 28, border: '1px solid var(--border)', borderRadius: '0 4px 4px 0', background: 'white', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>
                    {/* Total */}
                    <div style={{ textAlign: 'center', fontWeight: 800, color: 'var(--orange)', fontSize: 15 }}>
                      {(item.price * (qty[item._id] || 1)).toLocaleString('vi-VN')}đ
                    </div>
                    {/* Delete */}
                    <button onClick={() => removeItem(item._id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', background: 'none', fontSize: 16 }}>
                      <FaTrash size={15} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Action row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', border: '1.5px solid var(--border)', borderRadius: 8, background: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  <FaArrowLeft size={12} /> Tiếp tục mua sắm
                </button>
                <button onClick={clearCart} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', border: '1.5px solid #fee2e2', borderRadius: 8, background: '#fef2f2', color: '#dc2626', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  <FaTrash size={12} /> Xóa tất cả
                </button>
              </div>
            </div>

            {/* ===== ORDER SUMMARY ===== */}
            <div style={{ position: 'sticky', top: 80 }}>
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontWeight: 800, fontSize: 16, marginBottom: 16 }}>Thông tin đơn hàng</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
                  <span style={{ color: 'var(--text-gray)' }}>Tạm tính ({cart.length} sản phẩm)</span>
                  <span style={{ fontWeight: 600 }}>{subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
                    <span style={{ color: 'var(--text-gray)' }}>Giảm giá</span>
                    <span style={{ fontWeight: 600, color: '#ef4444' }}>-{discount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}

                {/* Coupon */}
                <div style={{ display: 'flex', gap: 8, margin: '14px 0' }}>
                  <input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="Nhập mã giảm giá"
                    style={{ flex: 1, padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 6, fontSize: 13, outline: 'none' }} />
                  <button onClick={applyCoupon} style={{ padding: '9px 14px', background: 'var(--primary)', color: 'white', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Áp dụng</button>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>Tổng tiền</span>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--orange)' }}>{total.toLocaleString('vi-VN')}đ</div>
                      <div style={{ fontSize: 11, color: 'var(--text-gray)' }}>Đã bao gồm VAT (nếu có)</div>
                    </div>
                  </div>
                </div>

                <button className="btn-primary-full" onClick={handleCheckout} disabled={loading} style={{ fontSize: 15, fontWeight: 800, marginBottom: 10 }}>
                  {loading ? 'Đang xử lý...' : 'Thanh toán ngay'}
                </button>
                <button className="btn-outline" style={{ width: '100%', padding: 11, fontSize: 14 }} onClick={handleCheckout}>
                  Thanh toán nhanh
                </button>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '12px 0', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-gray)' }}>Thanh toán với</span>
                  {['VISA','MC','Momo','ZaloPay'].map(p => <span key={p} style={{ fontSize: 10, fontWeight: 800, background: 'var(--bg-light)', padding: '3px 8px', borderRadius: 4, border: '1px solid var(--border)' }}>{p}</span>)}
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                  {[
                    { icon: <FaShieldAlt color="var(--primary)" />, t: 'Thanh toán bảo mật', d: 'Thông tin của bạn được bảo mật tuyệt đối' },
                    { icon: <FaUndo color="var(--primary)" />, t: 'Hoàn tiền 100%', d: 'Nếu không hài lòng trong vòng 7 ngày' },
                    { icon: <FaHeadset color="var(--primary)" />, t: 'Hỗ trợ khách hàng 24/7', d: 'Đội ngũ hỗ trợ luôn sẵn sàng' },
                  ].map(b => (
                    <div key={b.t} style={{ display: 'flex', gap: 10, padding: '8px 0', fontSize: 12 }}>
                      <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{b.icon}</span>
                      <div><div style={{ fontWeight: 700 }}>{b.t}</div><div style={{ color: 'var(--text-gray)' }}>{b.d}</div></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* CÓ THỂ BẠN CŨNG QUAN TÂM */}
        {related.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Có thể bạn cũng quan tâm</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 14 }}>
              {related.map(eb => (
                <div key={eb._id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', cursor: 'pointer' }} onClick={() => navigate(`/ebooks/${eb._id}`)}>
                  <div style={{ height: 100, background: 'linear-gradient(135deg,#1B6B4A,#2a9d5c)', position: 'relative' }}>
                    {eb.badge === 'best' && <span style={{ position: 'absolute', top: 6, left: 6, background: '#e8a020', color: 'white', fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 3 }}>BEST SELLER</span>}
                    {eb.badge === 'new' && <span style={{ position: 'absolute', top: 6, left: 6, background: 'var(--primary)', color: 'white', fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 3 }}>MỚI</span>}
                  </div>
                  <div style={{ padding: '10px 10px 12px' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.3, marginBottom: 3, height: 30, overflow: 'hidden' }}>{eb.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-gray)', marginBottom: 8 }}>tự túc chi tiết</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--orange)' }}>{eb.price?.toLocaleString('vi-VN')}đ</span>
                      <button onClick={e => { e.stopPropagation(); setCart(prev => prev.find(c => c._id === eb._id) ? prev : [...prev, eb]); }}
                        style={{ background: 'var(--primary)', color: 'white', width: 24, height: 24, borderRadius: 5, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TRUST FEATURES */}
        <div style={{ marginTop: 40, background: 'var(--bg-light)', borderRadius: 12, padding: '24px 32px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
          {[
            { icon: <FaDownload size={24} color="var(--primary)" />, t: 'Mua là dùng ngay', d: 'Thanh toán thành công là tải về ngay' },
            { icon: <FaFileAlt size={24} color="var(--primary)" />, t: 'File chất lượng cao', d: 'PDF rõ nét, bố cục đẹp, dễ đọc trên mọi thiết bị' },
            { icon: <FaSyncAlt size={24} color="var(--primary)" />, t: 'Cập nhật liên tục', d: 'Nội dung được cập nhật thường xuyên' },
            { icon: <FaHeadset size={24} color="var(--primary)" />, t: 'Hỗ trợ tận tâm', d: 'Đội ngũ hỗ trợ 24/7 qua email và chat' },
          ].map(f => (
            <div key={f.t} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ flexShrink: 0, marginTop: 2 }}>{f.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{f.t}</div>
                <div style={{ fontSize: 12, color: 'var(--text-gray)', lineHeight: 1.5 }}>{f.d}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
      <Footer />
    </div>
  );
}
