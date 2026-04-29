import { FaArrowUp, FaShoppingBag, FaUsers, FaBook, FaEye, FaBoxOpen, FaStar, FaEdit, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const StatCard = ({ label, value, growth, icon, color, bg }) => (
  <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: '18px 20px', flex: 1 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>{label}</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>{value}</div>
        <div style={{ fontSize: 12, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
          <FaArrowUp size={10} /> {growth}% so với tháng trước
        </div>
      </div>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontSize: 20 }}>{icon}</div>
    </div>
  </div>
);

const SimpleChart = ({ data }) => {
  if (!data?.length) return <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 13 }}>Chưa có dữ liệu</div>;
  const max = Math.max(...data.map(d => d.revenue), 1);
  const W = 460, H = 160, pad = 30;
  const pts = data.map((d, i) => {
    const x = pad + (i / (data.length - 1 || 1)) * (W - pad * 2);
    const y = H - pad - ((d.revenue / max) * (H - pad * 2));
    return `${x},${y}`;
  }).join(' ');
  const area = `M${pts.split(' ')[0]} L${pts} L${data.length > 0 ? (pad + (W - pad * 2)) : pad},${H - pad} L${pad},${H - pad} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 160 }}>
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a9d5c" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#2a9d5c" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#g1)" />
      <polyline points={pts} fill="none" stroke="#2a9d5c" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => {
        const x = pad + (i / (data.length - 1 || 1)) * (W - pad * 2);
        const y = H - pad - ((d.revenue / max) * (H - pad * 2));
        return <circle key={i} cx={x} cy={y} r="3.5" fill="white" stroke="#2a9d5c" strokeWidth="2" />;
      })}
    </svg>
  );
};

export default function AdminDashboard({ stats, ebooks, orders }) {
  const rev = (stats?.totalRevenue || 0).toLocaleString('vi-VN');
  const topEbooks = [...(ebooks || [])].sort((a, b) => (b.sales || 0) - (a.sales || 0)).slice(0, 5);
  const recentOrders = [...(orders || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const COLORS = { hot: '#2a9d5c', new: '#3b82f6', cancelled: '#ef4444' };

  return (
    <div>
      {/* Title + date */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Tổng quan</h1>
          <p style={{ fontSize: 13, color: '#6b7280' }}>Thống kê tổng quan hoạt động của hệ thống</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 14px', fontSize: 13, color: '#374151' }}>
          📅 01/05/2024 – 31/05/2024 ▾
        </div>
      </div>

      {/* 5 Stat cards */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
        <StatCard label="Tổng doanh thu" value={`${rev}đ`} growth="18.6" icon={<FaShoppingBag />} color="#2a9d5c" bg="#f0faf5" />
        <StatCard label="Đơn hàng" value={stats?.totalOrders || 0} growth="15.2" icon={<FaBoxOpen />} color="#3b82f6" bg="#eff6ff" />
        <StatCard label="Khách hàng mới" value="—" growth="12.7" icon={<FaUsers />} color="#8b5cf6" bg="#f5f3ff" />
        <StatCard label="Sản phẩm đã bán" value={ebooks?.reduce((s, e) => s + (e.sales || 0), 0)} growth="16.3" icon={<FaBook />} color="#e8a020" bg="#fffbeb" />
        <StatCard label="Lượt truy cập" value="24.680" growth="9.5" icon={<FaEye />} color="#06b6d4" bg="#ecfeff" />
      </div>

      {/* 2 col */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Chart */}
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: 15 }}>Doanh thu</h3>
              <select style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 10px', fontSize: 12, outline: 'none', background: 'white' }}>
                <option>7 ngày gần đây</option>
                <option>30 ngày gần đây</option>
              </select>
            </div>
            <SimpleChart data={stats?.monthlyRevenue} />
          </div>

          {/* Top products table */}
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: 15 }}>Sản phẩm bán chạy</h3>
              <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>Xem tất cả</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['#','Sản phẩm','Danh mục','Đã bán','Doanh thu'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#6b7280', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topEbooks.map((e, i) => (
                  <tr key={e._id} style={{ borderTop: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px', color: '#6b7280' }}>{i + 1}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 28, background: 'linear-gradient(135deg,var(--primary),#6ee7b7)', borderRadius: 4 }} />
                        <span style={{ fontWeight: 600 }}>{e.title}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px', color: '#6b7280' }}>Guide trong nước</td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{e.sales || 0}</td>
                    <td style={{ padding: '12px', fontWeight: 700, color: 'var(--primary)' }}>{((e.sales || 0) * e.price).toLocaleString('vi-VN')}đ</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {topEbooks.length === 0 && <div style={{ textAlign: 'center', padding: 20, color: '#9ca3af' }}>Chưa có dữ liệu</div>}
            <div style={{ textAlign: 'center', marginTop: 14 }}>
              <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>Xem tất cả sản phẩm →</span>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Recent orders */}
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: 15 }}>Đơn hàng mới nhất</h3>
              <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>Xem tất cả</span>
            </div>
            {recentOrders.map(o => (
              <div key={o._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),#6ee7b7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: 13, flexShrink: 0 }}>
                  {o.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>#{o._id.slice(-7).toUpperCase()}</div>
                  <div style={{ fontSize: 12, color: '#374151', fontWeight: 600, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{o.user?.name || '—'}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>{new Date(o.createdAt).toLocaleDateString('vi-VN')}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{o.totalAmount?.toLocaleString('vi-VN')}đ</div>
                  <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>Đã thanh toán</span>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && <div style={{ textAlign: 'center', padding: 20, color: '#9ca3af', fontSize: 13 }}>Chưa có đơn hàng</div>}
          </div>

          {/* Category donut */}
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Thống kê theo danh mục</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <svg viewBox="0 0 100 100" style={{ width: 80, height: 80, flexShrink: 0 }}>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="18" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#2a9d5c" strokeWidth="18" strokeDasharray="170 82" strokeDashoffset="25" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="18" strokeDasharray="60 192" strokeDashoffset="-145" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e8a020" strokeWidth="18" strokeDasharray="22 230" strokeDashoffset="-205" />
              </svg>
              <div style={{ flex: 1, fontSize: 12 }}>
                {[['#2a9d5c','Guide trong nước','68%','87.232.000đ'],['#3b82f6','Guide quốc tế','24%','30.768.000đ'],['#e8a020','Combo guide','8%','10.450.000đ']].map(([c,l,p,v]) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: c, flexShrink: 0 }} />
                    <span style={{ color: '#374151', flex: 1 }}>{l}</span>
                    <span style={{ fontWeight: 700 }}>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity */}
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: 15 }}>Hoạt động gần đây</h3>
              <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>Xem tất cả</span>
            </div>
            {[
              { icon: <FaPlus />, color: '#2a9d5c', bg: '#f0faf5', text: 'Admin đã thêm guide mới "Guide Nha Trang 3N2Đ"', time: '31/05/2024 15:20' },
              { icon: <FaBoxOpen />, color: '#3b82f6', bg: '#eff6ff', text: 'Nguyễn Hoàng Sơn đã đặt hàng #TG250530', time: '30/05/2024 09:15' },
              { icon: <FaEdit />, color: '#e8a020', bg: '#fffbeb', text: 'Sửa thông tin sản phẩm "Guide Đà Lạt 3N2Đ"', time: '29/05/2024 16:30' },
              { icon: <FaStar />, color: '#f59e0b', bg: '#fffbeb', text: 'Phan Trí Tâm đã đánh giá 5 sao cho sản phẩm', time: '28/05/2024 11:10' },
            ].map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '9px 0', borderBottom: i < 3 ? '1px solid #f3f4f6' : 'none' }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: a.bg, color: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>{a.icon}</div>
                <div>
                  <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.4 }}>{a.text}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
