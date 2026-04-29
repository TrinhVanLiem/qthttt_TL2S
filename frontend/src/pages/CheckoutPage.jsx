import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TopBar, Navbar, Footer } from '../components/Layout';
import { FaShieldAlt, FaEnvelope, FaDownload, FaCreditCard, FaCheck, FaLock } from 'react-icons/fa';
import { BsBank, BsCashCoin } from 'react-icons/bs';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const PAYMENT_METHODS = [
  { id: 'card', icon: <><img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" style={{ height: 18 }} /><img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg" alt="MC" style={{ height: 18 }} /><span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 700, marginLeft: 4 }}>momo</span></>, label: 'Thẻ ATM / Visa / MasterCard', sub: 'Thanh toán qua cổng VNPAY' },
  { id: 'momo', icon: <span style={{ fontSize: 13, fontWeight: 800, color: '#ae2070' }}>MoMo</span>, label: 'Ví MoMo', sub: 'Thanh toán nhanh qua ví MoMo' },
  { id: 'zalopay', icon: <span style={{ fontSize: 13, fontWeight: 800, color: '#0068ff' }}>ZaloPay</span>, label: 'ZaloPay', sub: 'Thanh toán qua ứng dụng ZaloPay' },
  { id: 'bank', icon: <BsBank size={20} color="var(--text-gray)" />, label: 'Chuyển khoản ngân hàng', sub: 'Chuyển khoản và gửi xác nhận thanh toán' },
  { id: 'cod', icon: <BsCashCoin size={20} color="var(--text-gray)" />, label: 'Thanh toán sau (nội địa)', sub: 'Thanh toán khi nhận thông tin guide (Áp dụng cho một số guide)' },
];

const RECEIVES = ['File PDF chất lượng cao', 'Nội dung chi tiết, dễ hiểu', 'Bản đồ, bảng chi phí, kinh nghiệm thực tế', 'Cập nhật mới nhất 2024', 'Hỗ trợ khách hàng 24/7'];

export default function CheckoutPage({ cart, setCart }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '', email: user?.email || '', phone: '',
    delivery: 'email', payment: 'card',
    invoice: false, companyName: '', taxCode: '', address: '',
    agree: false,
  });
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  const subtotal = cart.reduce((s, i) => s + i.price * (i.quantity || 1), 0);
  const total = subtotal - discount;

  const applyCoupon = () => {
    if (coupon.toUpperCase() === 'TRAVEL10') { setDiscount(Math.round(subtotal * 0.1)); alert('Áp dụng mã giảm 10%!'); }
    else alert('Mã không hợp lệ');
  };

  const handleSubmit = async () => {
    if (!user) return navigate('/login');
    if (!form.name.trim()) return alert('Vui lòng nhập họ và tên!');
    if (!form.email.trim()) return alert('Vui lòng nhập email!');
    if (!form.phone.trim()) return alert('Vui lòng nhập số điện thoại!');
    if (!form.agree) return alert('Vui lòng đồng ý với điều khoản sử dụng!');
    if (cart.length === 0) return alert('Giỏ hàng trống!');
    setLoading(true);
    try {
      await api.post('/orders', {
        items: cart.map(i => ({ ebookId: i._id })),
        paymentMethod: form.payment,
      });
      setCart([]);
      navigate('/orders', { state: { justOrdered: true } });
    } catch (err) {
      alert(err.response?.data?.message || 'Thanh toán thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const inp = (field, value) => setForm(f => ({ ...f, [field]: value }));

  return (
    <div>
      <TopBar />
      <Navbar />

      {/* BREADCRUMB */}
      <div style={{ background: '#f8fafb', borderBottom: '1px solid var(--border)', padding: '10px 0', fontSize: 13 }}>
        <div className="container" style={{ display: 'flex', gap: 6, color: 'var(--text-gray)' }}>
          <Link to="/" style={{ color: 'var(--primary)' }}>Trang chủ</Link> ›
          <Link to="/cart" style={{ color: 'var(--primary)' }}>Giỏ hàng</Link> ›
          <span>Thanh toán</span>
        </div>
      </div>

      <div className="container" style={{ padding: '28px 20px 60px' }}>

        {/* TITLE + STEPS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Thanh toán</h1>
            <p style={{ fontSize: 13, color: 'var(--text-gray)' }}>Hoàn tất đơn hàng để nhận guide và bắt đầu hành trình của bạn</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {[
              { n: 1, icon: <FaCheck size={13} />, label: 'Giỏ hàng', done: true },
              { n: 2, label: 'Thanh toán', active: true },
              { n: 3, label: 'Hoàn tất', active: false },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: s.done ? 'var(--primary)' : s.active ? 'var(--primary)' : '#e5e7eb', color: s.done || s.active ? 'white' : '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, margin: '0 auto 4px' }}>
                    {s.icon || s.n}
                  </div>
                  <div style={{ fontSize: 11, color: s.done || s.active ? 'var(--primary)' : '#9ca3af', fontWeight: s.active ? 700 : 400 }}>{s.label}</div>
                </div>
                {i < 2 && <div style={{ width: 60, height: 2, background: i === 0 ? 'var(--primary)' : '#e5e7eb', margin: '0 4px 18px' }} />}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 28, alignItems: 'flex-start' }}>

          {/* ===== LEFT FORM ===== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* 1. Thông tin khách hàng */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
              <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 18, color: 'var(--primary)' }}>1. Thông tin khách hàng</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-gray)', display: 'block', marginBottom: 5 }}>Họ và tên *</label>
                  <input value={form.name} onChange={e => inp('name', e.target.value)} placeholder="Phan Trí Tâm"
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-gray)', display: 'block', marginBottom: 5 }}>Email *</label>
                  <input type="email" value={form.email} onChange={e => inp('email', e.target.value)} placeholder="phan@gmail.com"
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-gray)', display: 'block', marginBottom: 5 }}>Số điện thoại *</label>
                <input value={form.phone} onChange={e => inp('phone', e.target.value)} placeholder="0901 234 567"
                  style={{ width: '50%', padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            {/* 2. Phương thức nhận guide */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
              <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 16, color: 'var(--primary)' }}>2. Phương thức nhận guide</h3>
              {[
                { id: 'email', icon: <FaEnvelope size={18} color="var(--primary)" />, label: 'Nhận qua email', sub: 'File guide sẽ được gửi đến email của bạn sau khi thanh toán thành công' },
                { id: 'download', icon: <FaDownload size={18} color="var(--text-gray)" />, label: 'Tải trực tiếp', sub: 'Tải file guide ngay sau khi thanh toán thành công' },
              ].map(m => (
                <div key={m.id} onClick={() => inp('delivery', m.id)}
                  style={{ display: 'flex', gap: 14, padding: '14px 16px', borderRadius: 8, border: `1.5px solid ${form.delivery === m.id ? 'var(--primary)' : 'var(--border)'}`, background: form.delivery === m.id ? '#f0faf5' : 'white', cursor: 'pointer', marginBottom: 10, alignItems: 'center' }}>
                  <input type="radio" readOnly checked={form.delivery === m.id} style={{ accentColor: 'var(--primary)', flexShrink: 0 }} />
                  <span style={{ flexShrink: 0 }}>{m.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{m.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-gray)', marginTop: 2 }}>{m.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* 3. Phương thức thanh toán */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
              <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 16, color: 'var(--primary)' }}>3. Phương thức thanh toán</h3>
              {PAYMENT_METHODS.map(m => (
                <div key={m.id} onClick={() => inp('payment', m.id)}
                  style={{ display: 'flex', gap: 14, padding: '13px 16px', borderRadius: 8, border: `1.5px solid ${form.payment === m.id ? 'var(--primary)' : 'var(--border)'}`, background: form.payment === m.id ? '#f0faf5' : 'white', cursor: 'pointer', marginBottom: 10, alignItems: 'center' }}>
                  <input type="radio" readOnly checked={form.payment === m.id} style={{ accentColor: 'var(--primary)', flexShrink: 0 }} />
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', minWidth: 90 }}>{m.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{m.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-gray)', marginTop: 2 }}>{m.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* 4. Thông tin xuất hóa đơn */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
              <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 16, color: 'var(--primary)' }}>4. Thông tin xuất hóa đơn <span style={{ fontWeight: 400, color: 'var(--text-gray)', fontSize: 13 }}>(tùy chọn)</span></h3>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14, cursor: 'pointer', marginBottom: form.invoice ? 16 : 0 }}>
                <input type="checkbox" checked={form.invoice} onChange={e => inp('invoice', e.target.checked)} style={{ accentColor: 'var(--primary)', width: 16, height: 16 }} />
                Xuất hóa đơn công ty
              </label>
              {form.invoice && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, color: 'var(--text-gray)', display: 'block', marginBottom: 4 }}>Tên công ty</label>
                      <input value={form.companyName} onChange={e => inp('companyName', e.target.value)} placeholder="Tên công ty"
                        style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: 'var(--text-gray)', display: 'block', marginBottom: 4 }}>Mã số thuế</label>
                      <input value={form.taxCode} onChange={e => inp('taxCode', e.target.value)} placeholder="Mã số thuế"
                        style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text-gray)', display: 'block', marginBottom: 4 }}>Địa chỉ</label>
                    <input value={form.address} onChange={e => inp('address', e.target.value)} placeholder="Địa chỉ công ty"
                      style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Security + Agree */}
            <div style={{ background: '#f0faf5', border: '1px solid #c8e6d8', borderRadius: 10, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'center' }}>
              <FaShieldAlt size={22} color="var(--primary)" flexShrink={0} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Thông tin của bạn được bảo mật tuyệt đối</div>
                <div style={{ fontSize: 12, color: 'var(--text-gray)' }}>Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn và không chia sẻ cho bên thứ ba.</div>
              </div>
            </div>

            <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.agree} onChange={e => inp('agree', e.target.checked)} style={{ accentColor: 'var(--primary)', width: 16, height: 16, flexShrink: 0 }} />
              <span>Tôi đã đọc và đồng ý với <a href="#" style={{ color: 'var(--primary)' }}>Điều khoản sử dụng</a> và <a href="#" style={{ color: 'var(--primary)' }}>Chính sách bảo mật</a></span>
            </label>
          </div>

          {/* ===== RIGHT: ORDER SUMMARY ===== */}
          <div style={{ position: 'sticky', top: 80 }}>
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
              <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>Đơn hàng của bạn ({cart.length} sản phẩm)</h3>

              {/* Item list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)', maxHeight: 240, overflowY: 'auto' }}>
                {cart.map(item => (
                  <div key={item._id} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg,#1B6B4A,#2a9d5c)', borderRadius: 6, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-gray)' }}>tự túc chi tiết {item.quantity > 1 ? `×${item.quantity}` : ''}</div>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{(item.price * (item.quantity || 1)).toLocaleString('vi-VN')}đ</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
                <span style={{ color: 'var(--text-gray)' }}>Tạm tính</span>
                <span style={{ fontWeight: 600 }}>{subtotal.toLocaleString('vi-VN')}đ</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
                  <span style={{ color: 'var(--text-gray)' }}>Giảm giá</span>
                  <span style={{ fontWeight: 600, color: '#ef4444' }}>-{discount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}

              {/* Coupon */}
              <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
                <input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="Nhập mã giảm giá"
                  style={{ flex: 1, padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 6, fontSize: 13, outline: 'none' }} />
                <button onClick={applyCoupon} style={{ padding: '9px 14px', background: 'var(--primary)', color: 'white', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Áp dụng</button>
              </div>

              {/* Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '1px solid var(--border)', marginBottom: 16 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>Tổng tiền</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--orange)' }}>{total.toLocaleString('vi-VN')}đ</div>
                  <div style={{ fontSize: 11, color: 'var(--text-gray)' }}>Đã bao gồm VAT (nếu có)</div>
                </div>
              </div>

              {/* Bạn sẽ nhận được */}
              <div style={{ background: 'var(--bg-light)', borderRadius: 8, padding: 14, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Bạn sẽ nhận được</div>
                {RECEIVES.map(r => (
                  <div key={r} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-gray)', marginBottom: 5, alignItems: 'center' }}>
                    <FaCheck size={10} color="var(--primary)" style={{ flexShrink: 0 }} /> {r}
                  </div>
                ))}
              </div>

              {/* Checkout button */}
              <button onClick={handleSubmit} disabled={loading}
                style={{ width: '100%', padding: '14px 0', background: loading ? '#9ca3af' : 'var(--primary)', color: 'white', borderRadius: 8, fontWeight: 800, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <FaLock size={14} />
                {loading ? 'Đang xử lý...' : `Thanh toán ${total.toLocaleString('vi-VN')}đ`}
              </button>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}
