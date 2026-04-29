import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { TopBar, Navbar, Footer, Spinner } from '../components/Layout';
import { FaBoxOpen, FaInbox, FaCheck, FaDownload, FaEnvelope } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function OrdersPage() {
  const { user } = useAuth();
  const location = useLocation();
  const justOrdered = location.state?.justOrdered;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my').then(r => setOrders(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div><TopBar /><Navbar />
      <div className="container" style={{ padding: '40px 20px', minHeight: '60vh' }}>
        {/* BANNER SAU KHI THANH TOÁN */}
        {justOrdered && (
          <div style={{ background: '#f0faf5', border: '1.5px solid #6ee7b7', borderRadius: 12, padding: '20px 24px', marginBottom: 28, display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FaCheck size={20} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>Đặt hàng thành công! </div>
              <div style={{ fontSize: 13, color: 'var(--text-gray)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FaEnvelope size={12} color="var(--primary)" />
                Email xác nhận đã được gửi đến <strong style={{ color: 'var(--text-dark)' }}>{user?.email}</strong>. Cảm ơn bạn đã tin tưởng TravelGuide Hub!
              </div>
            </div>
          </div>
        )}
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 10 }}>
          <FaBoxOpen color="var(--primary)" /> Lịch sử đơn hàng
        </h1>
        {loading ? <Spinner /> : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-gray)' }}>
            <div style={{ fontSize: 60, color: 'var(--primary)', marginBottom: 16 }}><FaInbox /></div>
            <p>Bạn chưa có đơn hàng nào</p>
          </div>
        ) : orders.map(order => (
          <div key={order._id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-gray)' }}>Mã đơn hàng</div>
                <div style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 13 }}>#{order._id.slice(-8).toUpperCase()}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-gray)' }}>Ngày mua</div>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-gray)' }}>Tổng tiền</div>
                <div style={{ fontWeight: 800, color: 'var(--primary)' }}>{order.totalAmount?.toLocaleString('vi-VN')}đ</div>
              </div>
              <span style={{ background: '#dcfce7', color: '#16a34a', padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, alignSelf: 'center', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <FaCheck size={10} /> Hoàn thành
              </span>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              {order.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14 }}>
                  <span>{item.title || 'E-book guide'}</span>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontWeight: 700 }}>{item.price?.toLocaleString('vi-VN')}đ</span>
                    <button style={{ background: 'var(--primary)', color: 'white', padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <FaDownload size={10} /> Tải xuống
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
}
