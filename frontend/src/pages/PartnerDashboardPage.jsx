import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TopBar, Navbar, Footer } from '../components/Layout';
import {
  FaStore, FaPlusCircle, FaBook, FaChartBar, FaClock,
  FaCheckCircle, FaTimesCircle, FaHome, FaStar, FaCommentAlt, FaCloudUploadAlt, FaTimes
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const STATUS_BADGE = {
  approved: { label: 'Đã duyệt', bg: '#dcfce7', color: '#16a34a', icon: <FaCheckCircle size={10} /> },
  pending:  { label: 'Chờ duyệt', bg: '#fffbeb', color: '#d97706', icon: <FaClock size={10} /> },
  rejected: { label: 'Từ chối',  bg: '#fee2e2', color: '#dc2626', icon: <FaTimesCircle size={10} /> },
};

const CATEGORIES = {
  'mien-bac': 'Miền Bắc', 'mien-trung': 'Miền Trung', 'mien-nam': 'Miền Nam',
  'tay-nguyen': 'Tây Nguyên', 'dao-bien': 'Đảo & Biển', 'nuoc-ngoai': 'Nước ngoài',
};

export default function PartnerDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [ebooks, setEbooks] = useState([]);
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // New ebook form
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', price: '', category: 'mien-trung',
    location: '', duration: '', tags: '', badge: '',
  });
  // Upload state
  const [imgFiles, setImgFiles] = useState([]);
  const [imgPreviews, setImgPreviews] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const imgInputRef = useRef(null);
  const pdfInputRef = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get('/partner/my-ebooks'),
      api.get('/partner/stats'),
      api.get('/ebooks/partner/my-reviews').catch(() => ({ data: [] })),
    ]).then(([e, s, r]) => {
      setEbooks(e.data);
      setStats(s.data);
      setReviews(r.data);
    }).finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      setUploading(true);
      // Upload ảnh nếu có
      let images = [], thumbnail = '';
      if (imgFiles.length > 0) {
        const fd = new FormData();
        imgFiles.forEach(f => fd.append('images', f));
        const { data: up } = await api.post('/upload/images', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        images = up.images;
        thumbnail = images[0]?.url || '';
      }
      // Upload PDF nếu có
      let fileUrl = '';
      if (pdfFile) {
        const fd = new FormData(); fd.append('pdf', pdfFile);
        const { data: pdfData } = await api.post('/upload/pdf', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        fileUrl = pdfData.url;
      }
      setUploading(false);

      const { data } = await api.post('/partner/ebooks', {
        ...form,
        price: Number(form.price),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        images, thumbnail, fileUrl,
      });
      setEbooks(prev => [data, ...prev]);
      setShowForm(false);
      setForm({ title: '', description: '', price: '', category: 'mien-trung', location: '', duration: '', tags: '', badge: '' });
      setImgFiles([]); setImgPreviews([]); setPdfFile(null);
      alert('Ebook đã nộp lên Admin để xét duyệt!');
    } catch (err) {
      setUploading(false);
      alert(err.response?.data?.message || 'Lỗi tạo ebook');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f4f6f8' }}>
      <TopBar />
      <Navbar />

      {/* BREADCRUMB */}
      <div style={{ background: '#f8fafb', borderBottom: '1px solid var(--border)', padding: '10px 0', fontSize: 13 }}>
        <div className="container" style={{ display: 'flex', gap: 6, color: 'var(--text-gray)', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}><FaHome size={11} /> Trang chủ</Link> ›
          <span style={{ color: 'var(--text-dark)', fontWeight: 600 }}>Partner Dashboard</span>
        </div>
      </div>

      {/* HERO BANNER */}
      <div style={{ background: 'linear-gradient(135deg,#1B6B4A,#2a9d5c)', padding: '24px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <FaStore size={20} />
              <span style={{ fontSize: 22, fontWeight: 800 }}>Partner Dashboard</span>
            </div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>Xin chào, <strong>{user.name}</strong> · Đối tác TravelGuide Hub</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => navigate('/')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'rgba(255,255,255,0.15)', color: 'white', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.3)' }}>
              <FaHome size={12} /> Về trang chủ
            </button>
            <button onClick={() => setShowForm(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'white', color: 'var(--primary)', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              <FaPlusCircle size={13} /> Đăng ebook mới
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '24px 20px 60px', flex: 1 }}>

        {/* STATS */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
            {[
              { icon: <FaBook size={20} color="var(--primary)" />, label: 'Tổng Ebook', val: stats.totalEbooks, bg: '#f0faf5', c: 'var(--primary)' },
              { icon: <FaChartBar size={20} color="#2563eb" />, label: 'Lượt bán', val: stats.totalSales, bg: '#eff6ff', c: '#2563eb' },
              { icon: '💰', label: 'Doanh thu bạn nhận', val: (stats.partnerRevenue || 0).toLocaleString('vi-VN') + 'đ', bg: '#f0fdf4', c: '#16a34a', text: true },
              { icon: '⭐', label: 'Hoa hồng', val: `${stats.commissionRate}%`, bg: '#fffbeb', c: '#d97706', text: true },
            ].map((s, i) => (
              <div key={i} style={{ background: s.bg, borderRadius: 12, padding: '18px 20px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: s.text ? 24 : 'inherit', marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: s.text ? 18 : 28, fontWeight: 800, color: s.c }}>{s.val}</div>
              </div>
            ))}
          </div>
        )}

        {/* TABS */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'white', borderRadius: 10, padding: 4, border: '1px solid var(--border)', width: 'fit-content' }}>
          {[
            { key: 'overview', label: 'Tất cả', count: ebooks.length },
            { key: 'approved', label: 'Đã duyệt', count: ebooks.filter(e => e.approvalStatus === 'approved').length },
            { key: 'pending',  label: 'Chờ duyệt', count: ebooks.filter(e => e.approvalStatus === 'pending').length },
            { key: 'rejected', label: 'Bị từ chối', count: ebooks.filter(e => e.approvalStatus === 'rejected').length },
            { key: 'reviews',  label: 'Đánh giá', count: reviews.length, icon: <FaCommentAlt size={11} /> },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding: '7px 16px', borderRadius: 8, fontWeight: tab === t.key ? 700 : 500, fontSize: 13, background: tab === t.key ? 'var(--primary)' : 'none', color: tab === t.key ? 'white' : '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              {t.icon && t.icon}
              {t.label}
              <span style={{ background: tab === t.key ? 'rgba(255,255,255,0.25)' : '#f3f4f6', color: tab === t.key ? 'white' : '#6b7280', padding: '1px 6px', borderRadius: 10, fontSize: 11 }}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* EBOOK LIST */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Đang tải...</div>
        ) : tab === 'reviews' ? (
          /* ===== REVIEWS TAB ===== */
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
            {reviews.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <FaCommentAlt size={36} style={{ opacity: 0.15, marginBottom: 12 }} />
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Chưa có đánh giá nào</div>
                <div style={{ fontSize: 13, color: '#9ca3af' }}>Khi khách hàng đánh giá ebook của bạn, chúng sẽ hiển thị ở đây</div>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafb', borderBottom: '1px solid var(--border)' }}>
                    {['#', 'Khách hàng', 'Ebook', 'Đánh giá', 'Nhận xét', 'Ngày'].map(h => (
                      <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((rv, i) => (
                    <tr key={rv._id} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 ? '#fafafa' : 'white' }}>
                      <td style={{ padding: '12px 14px', color: '#9ca3af', width: 36 }}>{i + 1}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#1B6B4A,#2a9d5c)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 13 }}>
                            {rv.user?.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{rv.user?.name}</div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 13, color: '#374151', maxWidth: 160 }}>
                        <div style={{ fontWeight: 500 }}>{rv.ebook?.title}</div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: 2 }}>
                          {[1,2,3,4,5].map(s => (
                            <FaStar key={s} size={13} color={s <= rv.rating ? '#f59e0b' : '#e5e7eb'} />
                          ))}
                        </div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{rv.rating}/5</div>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 13, color: '#6b7280', maxWidth: 200 }}>
                        {rv.comment || <span style={{ color: '#d1d5db', fontStyle: 'italic' }}>Không có nhận xét</span>}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 11, color: '#9ca3af', whiteSpace: 'nowrap' }}>
                        {new Date(rv.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          /* ===== EBOOK LIST ===== */
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
            {ebooks.filter(e => tab === 'overview' || e.approvalStatus === tab).length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <FaBook size={40} style={{ opacity: 0.15, marginBottom: 12 }} />
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Chưa có ebook nào</div>
                <button onClick={() => setShowForm(true)}
                  style={{ background: 'var(--primary)', color: 'white', padding: '10px 24px', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <FaPlusCircle /> Đăng ebook đầu tiên
                </button>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafb', borderBottom: '1px solid var(--border)' }}>
                    {['#', 'Tiêu đề', 'Giá', 'Danh mục', 'Đánh giá', 'Đã bán', 'Trạng thái'].map(h => (
                      <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ebooks.filter(e => tab === 'overview' || e.approvalStatus === tab).map((eb, i) => {
                    const st = STATUS_BADGE[eb.approvalStatus] || STATUS_BADGE.pending;
                    return (
                      <tr key={eb._id} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 ? '#fafafa' : 'white' }}>
                        <td style={{ padding: '12px 14px', color: '#9ca3af', width: 36 }}>{i + 1}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{eb.title}</div>
                          <div style={{ fontSize: 11, color: '#9ca3af' }}>{eb.location} · {eb.duration}</div>
                          {eb.approvalStatus === 'rejected' && eb.rejectedReason && (
                            <div style={{ fontSize: 11, color: '#dc2626', marginTop: 2 }}>
                              ⚠️ Lý do: {eb.rejectedReason}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--primary)' }}>{eb.price?.toLocaleString('vi-VN')}đ</td>
                        <td style={{ padding: '12px 14px', fontSize: 12, color: '#6b7280' }}>{CATEGORIES[eb.category] || eb.category}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FaStar size={12} color="#f59e0b" /> {(eb.rating || 0).toFixed(1)}
                            <span style={{ fontSize: 11, color: '#9ca3af' }}>({eb.numReviews || 0})</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: 600 }}>{eb.sales || 0}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700, background: st.bg, color: st.color }}>
                            {st.icon} {st.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* ===== NEW EBOOK FORM MODAL ===== */}
      {showForm && (
        <>
          <div onClick={() => setShowForm(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200 }} />
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 500, background: 'white', zIndex: 201, overflowY: 'auto', boxShadow: '-4px 0 24px rgba(0,0,0,0.12)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 17 }}>Đăng ebook mới</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Ebook sẽ được Admin xét duyệt trước khi đăng</div>
              </div>
              <button onClick={() => setShowForm(false)} style={{ width: 32, height: 32, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Tiêu đề *', key: 'title', placeholder: 'VD: Guide Phú Quốc 4N3Đ' },
                { label: 'Địa điểm *', key: 'location', placeholder: 'VD: Phú Quốc, Kiên Giang' },
                { label: 'Thời gian', key: 'duration', placeholder: 'VD: 4 ngày 3 đêm' },
                { label: 'Tags (cách bởi dấu phẩy)', key: 'tags', placeholder: 'gia đình, tiết kiệm, biển' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{f.label}</label>
                  <input value={form[f.key]} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder}
                    required={f.label.includes('*')}
                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
                </div>
              ))}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Danh mục</label>
                  <select value={form.category} onChange={e => set('category', e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', background: 'white', fontFamily: 'inherit' }}>
                    {Object.entries(CATEGORIES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Giá (VNĐ) *</label>
                  <input type="number" value={form.price} onChange={e => set('price', e.target.value)} required
                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Mô tả *</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)} required
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, minHeight: 120, resize: 'vertical', outline: 'none', fontFamily: 'inherit' }} />
              </div>

              {/* ===== UPLOAD ẢNH ===== */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  <FaCloudUploadAlt style={{ marginRight: 5 }} /> Hình ảnh ebook (tối đa 5 ảnh)
                </label>
                {imgPreviews.length < 5 && (
                  <div onClick={() => imgInputRef.current?.click()}
                    style={{ border: '2px dashed #e5e7eb', borderRadius: 10, padding: 16, textAlign: 'center', cursor: 'pointer', background: '#f9fafb' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}>
                    <FaCloudUploadAlt size={24} color="#9ca3af" style={{ marginBottom: 4 }} />
                    <div style={{ fontSize: 12, color: '#6b7280' }}>Click chọn ảnh (JPG, PNG)</div>
                  </div>
                )}
                <input ref={imgInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
                  onChange={e => {
                    const files = [...imgFiles, ...Array.from(e.target.files)].slice(0, 5);
                    setImgFiles(files);
                    setImgPreviews(files.map(f => URL.createObjectURL(f)));
                  }} />
                {imgPreviews.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6, marginTop: 8 }}>
                    {imgPreviews.map((src, i) => (
                      <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 6, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {i === 0 && <span style={{ position: 'absolute', top: 2, left: 2, background: 'var(--primary)', color: 'white', fontSize: 8, fontWeight: 700, padding: '1px 4px', borderRadius: 3 }}>Ảnh bìa</span>}
                        <button type="button" onClick={() => {
                          const nf = imgFiles.filter((_, j) => j !== i);
                          setImgFiles(nf); setImgPreviews(nf.map(f => URL.createObjectURL(f)));
                        }} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.5)', color: 'white', borderRadius: '50%', width: 16, height: 16, cursor: 'pointer', fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FaTimes size={7} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ===== UPLOAD PDF ===== */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  📄 File PDF Ebook *
                  <span style={{ fontSize: 11, fontWeight: 400, color: '#6b7280', marginLeft: 6 }}>(Chỉ người mua mới xem được)</span>
                </label>
                {!pdfFile ? (
                  <div onClick={() => pdfInputRef.current?.click()}
                    style={{ border: '2px dashed #e5e7eb', borderRadius: 10, padding: 16, textAlign: 'center', cursor: 'pointer', background: '#f9fafb' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#f59e0b'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>📄</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>Click chọn file PDF (tối đa 20MB)</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#fffbeb', border: '1.5px solid #fbbf24', borderRadius: 8 }}>
                    <span style={{ fontSize: 18 }}>📄</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 12 }}>{pdfFile.name}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{(pdfFile.size/1024/1024).toFixed(2)} MB</div>
                    </div>
                    <button type="button" onClick={() => setPdfFile(null)}
                      style={{ background: '#fee2e2', color: '#dc2626', padding: '3px 7px', borderRadius: 5, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>✕</button>
                  </div>
                )}
                <input ref={pdfInputRef} type="file" accept="application/pdf" style={{ display: 'none' }}
                  onChange={e => { if (e.target.files[0]) setPdfFile(e.target.files[0]); }} />
              </div>

              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#92400e' }}>
                📋 Sau khi nộp, ebook sẽ ở trạng thái <strong>Chờ duyệt</strong>. Admin sẽ xem xét và thông báo qua email.
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ flex: 1, padding: 12, border: '1.5px solid #e5e7eb', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer', background: 'white' }}>
                  Hủy
                </button>
                <button type="submit" disabled={saving || uploading}
                  style={{ flex: 2, padding: 12, background: 'var(--primary)', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {uploading ? '☁️ Đang upload...' : saving ? '⏳ Đang nộp...' : <><FaPlusCircle size={13} /> Nộp ebook</>}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
}
