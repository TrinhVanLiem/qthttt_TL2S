import { useState, useEffect, useRef } from 'react';
import { FaBook, FaBoxOpen, FaUsers, FaPlusCircle, FaStar, FaTrash, FaCheck, FaShieldAlt, FaCloudUploadAlt, FaTimes, FaImages, FaEdit, FaHandshake, FaClock, FaDownload, FaEye } from 'react-icons/fa';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import AdminDashboard from '../components/AdminDashboard';
import { Spinner } from '../components/Layout';
import api from '../api/axios';

const TH = ({ c }) => <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', background: '#f9fafb' }}>{c}</th>;
const TD = ({ children, s = {} }) => <td style={{ padding: '13px 14px', fontSize: 13, borderTop: '1px solid #f3f4f6', ...s }}>{children}</td>;

export default function AdminPage() {
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [ebooks, setEbooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', description: '', price: '', category: 'mien-trung', location: '', duration: '', tags: '', badge: '' });
  const [saving, setSaving] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  // Edit state
  const [editEbook, setEditEbook] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [partnerApps, setPartnerApps] = useState([]);
  const [pendingEbooks, setPendingEbooks] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  // Categories state
  const [categories, setCategories] = useState([]);
  const [catModal, setCatModal] = useState(null); // null | 'add' | category-object
  const [catForm, setCatForm] = useState({ name: '', slug: '', description: '', icon: '📁', color: '#1B6B4A', order: 0 });
  const [catSaving, setCatSaving] = useState(false);
  // PDF upload state (Admin create ebook)
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUploading, setPdfUploading] = useState(false);
  const pdfInputRef = useRef(null);

  // Promotions state — kết nối backend thật
  const [promos, setPromos] = useState([]);
  const [promoForm, setPromoForm] = useState({ code: '', discount: '', type: 'percent', minOrder: '', expiry: '', active: true });
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [copiedPromo, setCopiedPromo] = useState(null);
  const [promoSaving, setPromoSaving] = useState(false);

  // Settings state
  const [apiStatus, setApiStatus] = useState('idle');

  useEffect(() => {
    Promise.all([
      api.get('/orders/stats'),
      api.get('/ebooks'),
      api.get('/orders'),
      api.get('/users').catch(() => ({ data: [] })),
      api.get('/partner/admin/applications').catch(() => ({ data: [] })),
      api.get('/partner/admin/ebooks/pending').catch(() => ({ data: [] })),
      api.get('/ebooks/admin/reviews').catch(() => ({ data: [] })),
      api.get('/categories/all').catch(() => ({ data: [] })),
      api.get('/coupons').catch(() => ({ data: [] })),
    ]).then(([s, e, o, u, pa, pe, rv, cats, coupons]) => {
      setStats(s.data); setEbooks(e.data); setOrders(o.data); setUsers(u.data);
      setPartnerApps(pa.data); setPendingEbooks(pe.data); setAllReviews(rv.data);
      setCategories(cats.data); setPromos(coupons.data);
    }).finally(() => setLoading(false));
  }, []);

  const handleCreatePromo = async () => {
    if (!promoForm.code || !promoForm.discount) return alert('Vui lòng nhập mã và giá trị giảm');
    setPromoSaving(true);
    try {
      const { data } = await api.post('/coupons', {
        ...promoForm,
        discount: Number(promoForm.discount),
        minOrder: Number(promoForm.minOrder) || 0,
        expiry: promoForm.expiry || null,
      });
      setPromos(prev => [data, ...prev]);
      setShowPromoForm(false);
      setPromoForm({ code: '', discount: '', type: 'percent', minOrder: '', expiry: '', active: true });
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi tạo mã');
    } finally { setPromoSaving(false); }
  };

  const handleTogglePromo = async (promo) => {
    try {
      const { data } = await api.put(`/coupons/${promo._id}`, { active: !promo.active });
      setPromos(prev => prev.map(p => p._id === data._id ? data : p));
    } catch (err) { alert(err.response?.data?.message || 'Lỗi cập nhật'); }
  };

  const handleDeletePromo = async (promo) => {
    if (!window.confirm(`Xóa mã "${promo.code}"?`)) return;
    try {
      await api.delete(`/coupons/${promo._id}`);
      setPromos(prev => prev.filter(p => p._id !== promo._id));
    } catch (err) { alert(err.response?.data?.message || 'Lỗi xóa'); }
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      // Upload ảnh lên Cloudinary nếu có
      let images = uploadedImages;
      if (imageFiles.length > 0) {
        setUploading(true);
        const fd = new FormData();
        imageFiles.forEach(f => fd.append('images', f));
        const { data: up } = await api.post('/upload/images', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        images = up.images;
        setUploading(false);
      }
      const thumbnail = images[0]?.url || '';
      // Upload PDF nếu có
      let fileUrl = '';
      if (pdfFile) {
        setPdfUploading(true);
        const fd = new FormData(); fd.append('pdf', pdfFile);
        const { data: pdfData } = await api.post('/upload/pdf', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        fileUrl = pdfData.url;
        setPdfUploading(false);
      }
      const { data } = await api.post('/ebooks', { ...form, price: Number(form.price), tags, images, thumbnail, fileUrl });
      setEbooks([data, ...ebooks]);
      setForm({ title: '', description: '', price: '', category: 'mien-trung', location: '', duration: '', tags: '', badge: '' });
      setImageFiles([]); setImagePreviews([]); setUploadedImages([]); setPdfFile(null);
      alert('Tạo e-book thành công!');
    } catch (err) { alert(err.response?.data?.message || 'Lỗi tạo ebook'); }
    finally { setSaving(false); setUploading(false); }
  };

  const handlePickImages = (e) => {
    const files = Array.from(e.target.files);
    const total = imageFiles.length + files.length;
    if (total > 5) { alert('Tối đa 5 ảnh!'); return; }
    const newFiles = [...imageFiles, ...files].slice(0, 5);
    setImageFiles(newFiles);
    const previews = newFiles.map(f => URL.createObjectURL(f));
    setImagePreviews(previews);
  };

  const handleRemoveImage = (idx) => {
    const nf = imageFiles.filter((_, i) => i !== idx);
    setImageFiles(nf);
    setImagePreviews(nf.map(f => URL.createObjectURL(f)));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xoá e-book này?')) return;
    await api.delete(`/ebooks/${id}`);
    setEbooks(ebooks.filter(e => e._id !== id));
  };

  const openEdit = (eb) => {
    setEditEbook(eb);
    setEditForm({
      title: eb.title || '',
      description: eb.description || '',
      price: eb.price || '',
      category: eb.category || 'mien-trung',
      location: eb.location || '',
      duration: eb.duration || '',
      tags: (eb.tags || []).join(', '),
      badge: eb.badge || '',
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault(); setEditSaving(true);
    try {
      const tags = editForm.tags.split(',').map(t => t.trim()).filter(Boolean);
      const { data } = await api.put(`/ebooks/${editEbook._id}`, { ...editForm, price: Number(editForm.price), tags });
      setEbooks(ebooks.map(eb => eb._id === data._id ? data : eb));
      setEditEbook(null);
      alert('Cập nhật thành công!');
    } catch (err) { alert(err.response?.data?.message || 'Lỗi cập nhật'); }
    finally { setEditSaving(false); }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6f8' }}>
      <AdminSidebar tab={tab} setTab={setTab} badges={{
        partnerApps: partnerApps.filter(a => a.status === 'pending').length,
        pendingEbooks: pendingEbooks.length,
      }} />
      <div style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <AdminHeader />
        <main style={{ marginTop: 60, padding: 28, flex: 1 }}>
          {loading ? <Spinner /> : (<>

            {tab === 'dashboard' && <AdminDashboard stats={stats} ebooks={ebooks} orders={orders} />}

            {/* ===== DANH MỤC ===== */}
            {tab === 'categories' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h1 style={{ fontSize: 22, fontWeight: 800 }}>
                    Danh mục <span style={{ fontSize: 14, fontWeight: 400, color: '#6b7280' }}>({categories.length})</span>
                  </h1>
                  <button onClick={() => { setCatForm({ name: '', slug: '', description: '', icon: '📁', color: '#1B6B4A', order: 0 }); setCatModal('add'); }}
                    style={{ background: 'var(--primary)', color: 'white', padding: '9px 18px', borderRadius: 8, fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
                    <FaPlusCircle size={13} /> Thêm danh mục
                  </button>
                </div>

                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr>{['#', 'Icon', 'Tên danh mục', 'Slug', 'Mô tả', 'Thứ tự', 'Trạng thái', 'Thao tác'].map(h => <TH key={h} c={h} />)}</tr></thead>
                    <tbody>
                      {categories.map((cat, i) => (
                        <tr key={cat._id} style={{ background: i % 2 ? '#fafafa' : 'white' }}>
                          <TD s={{ color: '#9ca3af', width: 36 }}>{i + 1}</TD>
                          <TD>
                            <div style={{ width: 36, height: 36, borderRadius: 8, background: cat.color + '20', border: `1.5px solid ${cat.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                              {cat.icon}
                            </div>
                          </TD>
                          <TD s={{ fontWeight: 600 }}>{cat.name}</TD>
                          <TD s={{ fontFamily: 'monospace', fontSize: 12, color: '#6b7280' }}>{cat.slug}</TD>
                          <TD s={{ color: '#6b7280', maxWidth: 200 }}>{cat.description || '—'}</TD>
                          <TD s={{ textAlign: 'center' }}>{cat.order}</TD>
                          <TD>
                            <span style={{ padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700, background: cat.isActive ? '#dcfce7' : '#fee2e2', color: cat.isActive ? '#16a34a' : '#dc2626' }}>
                              {cat.isActive ? 'Hiển thị' : 'Ẩn'}
                            </span>
                          </TD>
                          <TD>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button onClick={() => { setCatForm({ name: cat.name, slug: cat.slug, description: cat.description || '', icon: cat.icon, color: cat.color, order: cat.order, isActive: cat.isActive }); setCatModal(cat); }}
                                style={{ background: '#eff6ff', color: '#2563eb', padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                                <FaEdit size={10} /> Sửa
                              </button>
                              <button onClick={async () => {
                                if (!window.confirm(`Xóa danh mục "${cat.name}"?`)) return;
                                await api.delete(`/categories/${cat._id}`);
                                setCategories(prev => prev.filter(c => c._id !== cat._id));
                              }} style={{ background: '#fee2e2', color: '#dc2626', padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                                <FaTrash size={10} /> Xóa
                              </button>
                            </div>
                          </TD>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {categories.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Chưa có danh mục nào. Nhấn "Thêm danh mục" để bắt đầu.</div>}
                </div>

                {/* ===== CATEGORY MODAL ===== */}
                {catModal && (
                  <>
                    <div onClick={() => setCatModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 300 }} />
                    <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'white', borderRadius: 14, width: 480, zIndex: 301, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
                      {/* Header */}
                      <div style={{ padding: '18px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
                        <div style={{ fontWeight: 800, fontSize: 16 }}>{catModal === 'add' ? '➕ Thêm danh mục mới' : `✏️ Sửa: ${catModal.name}`}</div>
                        <button onClick={() => setCatModal(null)} style={{ width: 28, height: 28, borderRadius: '50%', background: '#f3f4f6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaTimes size={12} /></button>
                      </div>

                      <form onSubmit={async (e) => {
                        e.preventDefault(); setCatSaving(true);
                        try {
                          if (catModal === 'add') {
                            const { data } = await api.post('/categories', catForm);
                            setCategories(prev => [...prev, data]);
                          } else {
                            const { data } = await api.put(`/categories/${catModal._id}`, catForm);
                            setCategories(prev => prev.map(c => c._id === catModal._id ? data : c));
                          }
                          setCatModal(null);
                        } catch (err) { alert(err.response?.data?.message || 'Lỗi'); }
                        finally { setCatSaving(false); }
                      }} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>

                        {/* Preview */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#f8fafb', borderRadius: 10, border: '1px solid #e5e7eb' }}>
                          <div style={{ width: 44, height: 44, borderRadius: 10, background: catForm.color + '20', border: `2px solid ${catForm.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{catForm.icon}</div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{catForm.name || 'Tên danh mục'}</div>
                            <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#9ca3af' }}>{catForm.slug || 'slug-danh-muc'}</div>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                          <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Tên danh mục *</label>
                            <input required value={catForm.name} onChange={e => {
                              const name = e.target.value;
                              // Auto-generate slug từ tên (luôn luôn, kể cả khi sửa)
                              const slug = name
                                .toLowerCase()
                                .normalize('NFD')
                                .replace(/[\u0300-\u036f]/g, '')
                                .replace(/[đĐ]/g, 'd')
                                .replace(/\s+/g, '-')
                                .replace(/[^a-z0-9-]/g, '')
                                .replace(/-+/g, '-')
                                .replace(/^-|-$/g, '');
                              setCatForm(f => ({ ...f, name, slug }));
                            }} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
                            {/* Hiển thị slug được tự tạo */}
                            {catForm.slug && (
                              <div style={{ marginTop: 6, fontSize: 11, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ color: '#9ca3af' }}>🔗 Slug:</span>
                                <code style={{ background: '#f3f4f6', padding: '1px 7px', borderRadius: 4, color: '#374151', fontFamily: 'monospace' }}>{catForm.slug}</code>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Mô tả</label>
                          <input value={catForm.description} onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))}
                            style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: 12 }}>
                          <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Icon (emoji)</label>
                            <input value={catForm.icon} onChange={e => setCatForm(f => ({ ...f, icon: e.target.value }))}
                              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 7, fontSize: 18, textAlign: 'center', outline: 'none' }} maxLength={4} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Màu sắc</label>
                            <input type="color" value={catForm.color} onChange={e => setCatForm(f => ({ ...f, color: e.target.value }))}
                              style={{ width: '100%', height: 38, border: '1.5px solid #e5e7eb', borderRadius: 7, cursor: 'pointer', padding: 2 }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Thứ tự</label>
                            <input type="number" value={catForm.order} onChange={e => setCatForm(f => ({ ...f, order: Number(e.target.value) }))}
                              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none' }} />
                          </div>
                        </div>

                        {catModal !== 'add' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <input type="checkbox" id="cat-active" checked={catForm.isActive} onChange={e => setCatForm(f => ({ ...f, isActive: e.target.checked }))} />
                            <label htmlFor="cat-active" style={{ fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Hiển thị danh mục này</label>
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                          <button type="button" onClick={() => setCatModal(null)}
                            style={{ flex: 1, padding: 11, border: '1.5px solid #e5e7eb', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer', background: 'white' }}>Hủy</button>
                          <button type="submit" disabled={catSaving}
                            style={{ flex: 2, padding: 11, background: 'var(--primary)', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            {catSaving ? '⏳ Đang lưu...' : <><FaCheck /> {catModal === 'add' ? 'Tạo danh mục' : 'Lưu thay đổi'}</>}
                          </button>
                        </div>
                      </form>
                    </div>
                  </>
                )}
              </div>
            )}

            {tab === 'reviews' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h1 style={{ fontSize: 22, fontWeight: 800 }}>
                    Quản lý Đánh giá
                    <span style={{ fontSize: 14, fontWeight: 400, color: '#6b7280', marginLeft: 8 }}>
                      ({allReviews.length} đánh giá)
                    </span>
                  </h1>
                </div>
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>{['#','Khách hàng','Ebook','Sao','Nhận xét','Ngày','Xóa'].map(h => <TH key={h} c={h} />)}</tr>
                    </thead>
                    <tbody>
                      {allReviews.map((rv, i) => (
                        <tr key={rv._id} style={{ background: i % 2 ? '#fafafa' : 'white', borderBottom: '1px solid #f3f4f6' }}>
                          <TD s={{ color: '#9ca3af', width: 36 }}>{i + 1}</TD>
                          <TD>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#1B6B4A,#2a9d5c)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                                {rv.user?.name?.charAt(0)?.toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 13 }}>{rv.user?.name}</div>
                                <div style={{ fontSize: 11, color: '#9ca3af' }}>{rv.user?.email}</div>
                              </div>
                            </div>
                          </TD>
                          <TD s={{ fontSize: 13, maxWidth: 160 }}>
                            <div style={{ fontWeight: 500 }}>{rv.ebook?.title}</div>
                          </TD>
                          <TD>
                            <div style={{ display: 'flex', gap: 2 }}>
                              {[1,2,3,4,5].map(s => (
                                <FaStar key={s} size={12} color={s <= rv.rating ? '#f59e0b' : '#e5e7eb'} />
                              ))}
                            </div>
                            <div style={{ fontSize: 11, color: '#9ca3af' }}>{rv.rating}/5</div>
                          </TD>
                          <TD s={{ fontSize: 13, color: '#6b7280', maxWidth: 220 }}>
                            {rv.comment || <span style={{ color: '#d1d5db', fontStyle: 'italic' }}>Không có nhận xét</span>}
                          </TD>
                          <TD s={{ fontSize: 11, color: '#9ca3af', whiteSpace: 'nowrap' }}>
                            {new Date(rv.createdAt).toLocaleDateString('vi-VN')}
                          </TD>
                          <TD>
                            <button
                              onClick={async () => {
                                if (!window.confirm(`Xóa đánh giá của "${rv.user?.name}"?`)) return;
                                await api.delete(`/ebooks/admin/reviews/${rv._id}`);
                                setAllReviews(prev => prev.filter(r => r._id !== rv._id));
                              }}
                              style={{ background: '#fee2e2', color: '#dc2626', padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
                            >
                              <FaTrash size={10} /> Xóa
                            </button>
                          </TD>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {allReviews.length === 0 && (
                    <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
                      Chưa có đánh giá nào trong hệ thống
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === 'partner-apps' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h1 style={{ fontSize: 22, fontWeight: 800 }}>Đơn đăng ký Đối tác <span style={{ fontSize: 14, fontWeight: 400, color: '#6b7280' }}>({partnerApps.filter(a => a.status === 'pending').length} chờ duyệt)</span></h1>
                </div>
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr>{['#', 'Người dùng', 'SĐT', 'CCCD', 'Ngân hàng', 'Ebook mẫu', 'Nộp lúc', 'Trạng thái', 'Thao tác'].map(h => <TH key={h} c={h} />)}</tr></thead>
                    <tbody>
                      {partnerApps.map((app, i) => (
                        <tr key={app._id} style={{ background: i % 2 ? '#fafafa' : 'white' }}>
                          <TD s={{ color: '#9ca3af', width: 36 }}>{i + 1}</TD>
                          <TD>
                            <div style={{ fontWeight: 600 }}>{app.user?.name}</div>
                            <div style={{ fontSize: 11, color: '#9ca3af' }}>{app.user?.email}</div>
                          </TD>
                          <TD s={{ color: '#6b7280' }}>{app.phone}</TD>
                          <TD s={{ color: '#6b7280', fontSize: 12 }}>{app.idNumber}</TD>
                          <TD s={{ fontSize: 12 }}>{app.bankName}<br /><span style={{ color: '#9ca3af' }}>{app.bankAccount}</span></TD>
                          <TD>
                            <a href={app.sampleFileUrl} target="_blank" rel="noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--primary)', fontSize: 12, fontWeight: 600 }}>
                              <FaDownload size={10} /> {app.sampleTitle?.slice(0, 20)}...
                            </a>
                          </TD>
                          <TD s={{ fontSize: 11, color: '#9ca3af' }}>{new Date(app.createdAt).toLocaleDateString('vi-VN')}</TD>
                          <TD>
                            <span style={{ padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700, background: app.status === 'pending' ? '#fffbeb' : app.status === 'approved' ? '#dcfce7' : '#fee2e2', color: app.status === 'pending' ? '#d97706' : app.status === 'approved' ? '#16a34a' : '#dc2626' }}>
                              {app.status === 'pending' ? 'Chờ duyệt' : app.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                            </span>
                          </TD>
                          <TD>
                            {app.status === 'pending' && (
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button onClick={async () => {
                                  await api.put(`/partner/admin/applications/${app._id}/approve`);
                                  setPartnerApps(prev => prev.map(a => a._id === app._id ? { ...a, status: 'approved' } : a));
                                  alert('Đã duyệt và gửi email!');
                                }} style={{ background: '#dcfce7', color: '#16a34a', padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                                  <FaCheck size={10} /> Duyệt
                                </button>
                                <button onClick={() => setRejectModal({ type: 'app', id: app._id, title: app.user?.name })}
                                  style={{ background: '#fee2e2', color: '#dc2626', padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                                  <FaTimes size={10} /> Từ chối
                                </button>
                              </div>
                            )}
                          </TD>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {partnerApps.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Chưa có đơn đăng ký nào</div>}
                </div>
              </div>
            )}

            {/* ===== EBOOK CHỜ DUYỆT ===== */}
            {tab === 'pending-ebooks' && (
              <div>
                <div style={{ marginBottom: 20 }}>
                  <h1 style={{ fontSize: 22, fontWeight: 800 }}>Ebook chờ duyệt <span style={{ fontSize: 14, fontWeight: 400, color: '#6b7280' }}>({pendingEbooks.length})</span></h1>
                </div>
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr>{['#', 'Tiêu đề', 'Đối tác', 'Giá', 'Danh mục', 'Nộp lúc', 'Thao tác'].map(h => <TH key={h} c={h} />)}</tr></thead>
                    <tbody>
                      {pendingEbooks.map((eb, i) => (
                        <tr key={eb._id} style={{ background: i % 2 ? '#fafafa' : 'white' }}>
                          <TD s={{ color: '#9ca3af', width: 36 }}>{i + 1}</TD>
                          <TD>
                            <div style={{ fontWeight: 600 }}>{eb.title}</div>
                            <div style={{ fontSize: 11, color: '#9ca3af' }}>{eb.location} · {eb.duration}</div>
                          </TD>
                          <TD>
                            <div style={{ fontSize: 13 }}>{eb.seller?.name}</div>
                            <div style={{ fontSize: 11, color: '#9ca3af' }}>{eb.seller?.email}</div>
                          </TD>
                          <TD s={{ fontWeight: 700, color: 'var(--primary)' }}>{eb.price?.toLocaleString('vi-VN')}đ</TD>
                          <TD s={{ fontSize: 12, color: '#6b7280' }}>{eb.category}</TD>
                          <TD s={{ fontSize: 11, color: '#9ca3af' }}>{new Date(eb.createdAt).toLocaleDateString('vi-VN')}</TD>
                          <TD>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button onClick={async () => {
                                await api.put(`/partner/admin/ebooks/${eb._id}/approve`);
                                setPendingEbooks(prev => prev.filter(e => e._id !== eb._id));
                                setEbooks(prev => [...prev, { ...eb, approvalStatus: 'approved', isApproved: true }]);
                                alert('Đã duyệt ebook và gửi email!');
                              }} style={{ background: '#dcfce7', color: '#16a34a', padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                                <FaCheck size={10} /> Duyệt
                              </button>
                              <button onClick={() => setRejectModal({ type: 'ebook', id: eb._id, title: eb.title })}
                                style={{ background: '#fee2e2', color: '#dc2626', padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                                <FaTimes size={10} /> Từ chối
                              </button>
                            </div>
                          </TD>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {pendingEbooks.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Không có ebook nào chờ duyệt 🎉</div>}
                </div>
              </div>
            )}

            {tab === 'ebooks' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h1 style={{ fontSize: 22, fontWeight: 800 }}>Guide (Sản phẩm) <span style={{ fontSize: 14, fontWeight: 400, color: '#6b7280' }}>({ebooks.length})</span></h1>
                  <button onClick={() => setTab('add')} style={{ background: 'var(--primary)', color: 'white', padding: '9px 18px', borderRadius: 8, fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
                    <FaPlusCircle size={13} /> Thêm mới
                  </button>
                </div>
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr>{['#','Tên Guide','Địa điểm','Giá','Đánh giá','Đã bán','Thao tác'].map(h => <TH key={h} c={h} />)}</tr></thead>
                    <tbody>
                      {ebooks.map((e, i) => (
                        <tr key={e._id} style={{ background: i % 2 ? '#fafafa' : 'white' }}>
                          <TD s={{ color: '#9ca3af', width: 40 }}>{i + 1}</TD>
                          <TD><div style={{ fontWeight: 600 }}>{e.title}</div><div style={{ fontSize: 11, color: '#9ca3af' }}>{e.category}</div></TD>
                          <TD s={{ color: '#6b7280' }}>{e.location}</TD>
                          <TD s={{ fontWeight: 700, color: 'var(--primary)' }}>{e.price?.toLocaleString('vi-VN')}đ</TD>
                          <TD><span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FaStar color="#f59e0b" size={11} /> {e.rating?.toFixed(1) || '5.0'}</span></TD>
                          <TD>{e.sales || 0}</TD>
                          <TD><div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => openEdit(e)} style={{ background: '#eff6ff', color: '#2563eb', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}><FaEdit size={10} /> Sửa</button>
                            <button onClick={() => handleDelete(e._id)} style={{ background: '#fee2e2', color: '#dc2626', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}><FaTrash size={10} /> Xoá</button>
                          </div></TD>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {ebooks.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Chưa có e-book nào</div>}
                </div>
              </div>
            )}

            {tab === 'orders' && (
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Đơn hàng <span style={{ fontSize: 14, fontWeight: 400, color: '#6b7280' }}>({orders.length})</span></h1>
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr>{['Mã đơn','Khách hàng','Sản phẩm','Tổng tiền','Ngày','Trạng thái'].map(h => <TH key={h} c={h} />)}</tr></thead>
                    <tbody>
                      {orders.map((o, i) => (
                        <tr key={o._id} style={{ background: i % 2 ? '#fafafa' : 'white' }}>
                          <TD><span style={{ fontFamily: 'monospace', fontSize: 12, background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>#{o._id.slice(-8).toUpperCase()}</span></TD>
                          <TD><div style={{ fontWeight: 600 }}>{o.user?.name || '—'}</div><div style={{ fontSize: 11, color: '#9ca3af' }}>{o.user?.email}</div></TD>
                          <TD>{o.items?.length} guide</TD>
                          <TD s={{ fontWeight: 700, color: 'var(--primary)' }}>{o.totalAmount?.toLocaleString('vi-VN')}đ</TD>
                          <TD s={{ color: '#6b7280' }}>{new Date(o.createdAt).toLocaleDateString('vi-VN')}</TD>
                          <TD><span style={{ background: '#dcfce7', color: '#16a34a', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}><FaCheck size={9} /> Hoàn thành</span></TD>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {orders.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Chưa có đơn hàng</div>}
                </div>
              </div>
            )}

            {tab === 'users' && (
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Người dùng <span style={{ fontSize: 14, fontWeight: 400, color: '#6b7280' }}>({users.length})</span></h1>
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr>{['#','Họ tên','Email','Vai trò','Ngày đăng ký'].map(h => <TH key={h} c={h} />)}</tr></thead>
                    <tbody>
                      {users.map((u, i) => (
                        <tr key={u._id} style={{ background: i % 2 ? '#fafafa' : 'white' }}>
                          <TD s={{ color: '#9ca3af', width: 40 }}>{i + 1}</TD>
                          <TD>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),#6ee7b7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'white' }}>{u.name?.charAt(0)?.toUpperCase()}</div>
                              <span style={{ fontWeight: 600 }}>{u.name}</span>
                            </div>
                          </TD>
                          <TD s={{ color: '#6b7280' }}>{u.email}</TD>
                          <TD><span style={{ background: u.role === 'admin' ? '#fef3c7' : '#f3f4f6', color: u.role === 'admin' ? '#92400e' : '#374151', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>{u.role === 'admin' ? <><FaShieldAlt size={9} /> Admin</> : 'User'}</span></TD>
                          <TD s={{ color: '#6b7280' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '—'}</TD>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Chưa có người dùng</div>}
                </div>
              </div>
            )}

            {/* ===== SETTINGS TAB ===== */}
            {tab === 'settings' && (
              <div style={{ maxWidth: 680 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Cài đặt hệ thống</h1>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* API Status */}
                  <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>🔌 Kết nối hệ thống</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                      {[
                        { label: 'Môi trường', val: import.meta.env.MODE || 'development', color: import.meta.env.MODE === 'production' ? '#16a34a' : '#d97706' },
                        { label: 'API URL', val: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', color: '#2563eb' },
                        { label: 'Version', val: '1.0.0', color: '#374151' },
                        { label: 'Thời gian', val: new Date().toLocaleDateString('vi-VN'), color: '#374151' },
                      ].map(s => (
                        <div key={s.label} style={{ background: '#f9fafb', borderRadius: 8, padding: '12px 14px', border: '1px solid #e5e7eb' }}>
                          <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: s.color, wordBreak: 'break-all' }}>{s.val}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <button
                        onClick={async () => {
                          setApiStatus('checking');
                          try {
                            await api.get('/');
                            setApiStatus('ok');
                          } catch {
                            setApiStatus('error');
                          }
                        }}
                        style={{ background: 'var(--primary)', color: 'white', padding: '9px 20px', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {apiStatus === 'checking' ? 'Đang kiểm tra...' : 'Test kết nối backend'}
                      </button>
                      {apiStatus === 'ok' && <span style={{ color: '#16a34a', fontWeight: 700, fontSize: 13 }}>Backend hoạt động tốt!</span>}
                      {apiStatus === 'error' && <span style={{ color: '#dc2626', fontWeight: 700, fontSize: 13 }}>❌ Không kết nối được backend</span>}
                    </div>
                  </div>

                  {/* Stats summary */}
                  <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>📊 Tóm tắt dữ liệu</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                      {[
                        { label: 'Tổng Ebook', val: ebooks.length, bg: '#f0faf5', color: 'var(--primary)' },
                        { label: 'Đơn hàng', val: orders.length, bg: '#eff6ff', color: '#2563eb' },
                        { label: 'Ngườọi dùng', val: users.length, bg: '#fdf4ff', color: '#7c3aed' },
                        { label: 'Danh mục', val: categories.length, bg: '#fffbeb', color: '#d97706' },
                      ].map(s => (
                        <div key={s.label} style={{ background: s.bg, borderRadius: 8, padding: '14px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
                          <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.val}</div>
                          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '14px 18px', fontSize: 13, color: '#92400e' }}>
                    ⚠️ Cài đặt nâng cao (Cloudinary, email SMTP, thanh toán) được quản lý qua biến môi trường trên server (Render). Liên hệ kỹ thuật để thay đổi.
                  </div>
                </div>
              </div>
            )}

            {/* ===== PROMOTIONS TAB ===== */}
            {tab === 'promotions' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h1 style={{ fontSize: 22, fontWeight: 800 }}>Mã giảm giá <span style={{ fontSize: 14, fontWeight: 400, color: '#6b7280' }}>({promos.length} mã)</span></h1>
                  <button onClick={() => setShowPromoForm(true)}
                    style={{ background: 'var(--primary)', color: 'white', padding: '9px 18px', borderRadius: 8, fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
                    <FaPlusCircle size={13} /> Tạo mã mới
                  </button>
                </div>


                {/* Create form */}
                {showPromoForm && (
                  <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Tạo mã mới</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Mã giảm giá *</label>
                        <input value={promoForm.code} onChange={e => setPromoForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                          placeholder="VD: SUMMER30" style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e5e7eb', borderRadius: 7, fontSize: 13, fontFamily: 'inherit', outline: 'none', textTransform: 'uppercase' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Loại giảm</label>
                        <select value={promoForm.type} onChange={e => setPromoForm(p => ({ ...p, type: e.target.value }))}
                          style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e5e7eb', borderRadius: 7, fontSize: 13, fontFamily: 'inherit', background: 'white' }}>
                          <option value="percent">% phần trăm</option>
                          <option value="fixed">Số tiền cố định</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Giá trị giảm *</label>
                        <input type="number" value={promoForm.discount} onChange={e => setPromoForm(p => ({ ...p, discount: e.target.value }))}
                          placeholder={promoForm.type === 'percent' ? '15 (%)'  : '30000 (đ)'} style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e5e7eb', borderRadius: 7, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Hóa đơn tối thiểu (đ)</label>
                        <input type="number" value={promoForm.minOrder} onChange={e => setPromoForm(p => ({ ...p, minOrder: e.target.value }))}
                          placeholder="0" style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e5e7eb', borderRadius: 7, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Ngày hết hạn</label>
                        <input type="date" value={promoForm.expiry} onChange={e => setPromoForm(p => ({ ...p, expiry: e.target.value }))}
                          style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e5e7eb', borderRadius: 7, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 2 }}>
                        <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                          <input type="checkbox" checked={promoForm.active} onChange={e => setPromoForm(p => ({ ...p, active: e.target.checked }))} />
                          Kích hoạt ngay
                        </label>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button type="button" onClick={() => setShowPromoForm(false)}
                        style={{ padding: '9px 20px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', background: 'white' }}>Hủy</button>
                      <button type="button" onClick={handleCreatePromo} disabled={promoSaving}
                        style={{ padding: '9px 20px', background: 'var(--primary)', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: promoSaving ? 0.7 : 1 }}>
                        <FaCheck size={12} /> {promoSaving ? 'Đang tạo...' : 'Tạo mã'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Promo table */}
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr>{['Mã', 'Loại giảm', 'Giá trị', 'Đơn tối thiểu', 'Hết hạn', 'Trạng thái', 'Thao tác'].map(h => <TH key={h} c={h} />)}</tr></thead>
                    <tbody>
                      {promos.map((p, i) => {
                        const expired = p.expiry && new Date(p.expiry) < new Date();
                        return (
                          <tr key={p._id || p.id} style={{ background: i % 2 ? '#fafafa' : 'white' }}>
                            <TD>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 13, background: '#f3f4f6', padding: '3px 8px', borderRadius: 5 }}>{p.code}</span>
                                <button onClick={() => { navigator.clipboard.writeText(p.code); setCopiedPromo(p._id || p.id); setTimeout(() => setCopiedPromo(null), 1500); }}
                                  style={{ background: 'none', color: copiedPromo === (p._id || p.id) ? '#16a34a' : '#9ca3af', fontSize: 11, cursor: 'pointer', padding: '2px 6px', border: '1px solid #e5e7eb', borderRadius: 4 }}>
                                  {copiedPromo === (p._id || p.id) ? '✓' : 'Copy'}
                                </button>
                              </div>
                            </TD>
                            <TD>{p.type === 'percent' ? 'Phần trăm' : 'Cố định'}</TD>
                            <TD s={{ fontWeight: 700, color: 'var(--primary)' }}>
                              {p.type === 'percent' ? `-${p.discount}%` : `-${Number(p.discount).toLocaleString('vi-VN')}đ`}
                            </TD>
                            <TD>{p.minOrder ? `${Number(p.minOrder).toLocaleString('vi-VN')}đ` : 'Không giới hạn'}</TD>
                            <TD s={{ color: expired ? '#dc2626' : '#6b7280' }}>{p.expiry || '—'}</TD>
                            <TD>
                              <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: p.active && !expired ? '#dcfce7' : '#fee2e2', color: p.active && !expired ? '#16a34a' : '#dc2626' }}>
                                {expired ? 'Hết hạn' : p.active ? 'Hoạt động' : 'Tắt'}
                              </span>
                            </TD>
                            <TD>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button onClick={() => handleTogglePromo(p)}
                                  style={{ background: p.active ? '#fef3c7' : '#dcfce7', color: p.active ? '#92400e' : '#16a34a', padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                                  {p.active ? 'Tắt' : 'Bật'}
                                </button>
                                <button onClick={() => handleDeletePromo(p)}
                                  style={{ background: '#fee2e2', color: '#dc2626', padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                                  <FaTrash size={9} /> Xóa
                                </button>
                              </div>
                            </TD>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {promos.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Chưa có mã giảm giá nào</div>}
                </div>
              </div>
            )}

            {tab === 'add' && (
              <div style={{ maxWidth: 640 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Thêm E-book mới</h1>
                <div style={{ background: 'white', borderRadius: 12, padding: 28, border: '1px solid #e5e7eb' }}>
                  <form onSubmit={handleCreate}>
                    {[['Tiêu đề *','title','VD: Guide Đà Nẵng 3N2Đ',true],['Địa điểm *','location','VD: Đà Nẵng',true],['Thời gian','duration','VD: 3N2Đ',false],['Tags','tags','VD: tiết kiệm, tự túc',false]].map(([l,k,p,r]) => (
                      <div key={k} style={{ marginBottom: 14 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{l}</label>
                        <input placeholder={p} value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} required={r}
                          style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
                      </div>
                    ))}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Danh mục</label>
                        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', background: 'white', fontFamily: 'inherit' }}>
                          {[['mien-bac','Miền Bắc'],['mien-trung','Miền Trung'],['mien-nam','Miền Nam'],['tay-nguyen','Tây Nguyên'],['dao-bien','Đảo & Biển'],['nuoc-ngoai','Nước ngoài']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Badge</label>
                        <select value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', background: 'white', fontFamily: 'inherit' }}>
                          <option value="">Không có</option>
                          <option value="hot">🔥 HOT</option>
                          <option value="new">✨ MỚI</option>
                          <option value="best">⭐ BEST SELLER</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Giá (VNĐ) *</label>
                      <input type="number" placeholder="VD: 79000" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
                    </div>
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Mô tả *</label>
                      <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required placeholder="Mô tả nội dung guide..." style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, minHeight: 100, resize: 'vertical', outline: 'none', fontFamily: 'inherit' }} />
                    </div>
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                        <FaImages size={13} style={{ marginRight: 6 }} />
                        Hình ảnh (tối đa 5 ảnh)
                      </label>
                      {/* Upload zone */}
                      <div onClick={() => fileInputRef.current?.click()}
                        style={{ border: '2px dashed #e5e7eb', borderRadius: 10, padding: '20px', textAlign: 'center', cursor: 'pointer', background: '#f9fafb', transition: 'border-color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}>
                        <FaCloudUploadAlt size={28} color="#9ca3af" style={{ marginBottom: 8 }} />
                        <div style={{ fontSize: 13, color: '#6b7280' }}>Click để chọn ảnh hoặc kéo thả vào đây</div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>JPG, PNG, WEBP — tối đa 5MB mỗi ảnh</div>
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePickImages} />

                      {/* Preview grid */}
                      {imagePreviews.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8, marginTop: 12 }}>
                          {imagePreviews.map((src, i) => (
                            <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                              <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              {i === 0 && <span style={{ position: 'absolute', top: 4, left: 4, background: 'var(--primary)', color: 'white', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>Ảnh bìa</span>}
                              <button onClick={() => handleRemoveImage(i)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 10 }}>
                                <FaTimes size={9} />
                              </button>
                            </div>
                          ))}
                          {imagePreviews.length < 5 && (
                            <div onClick={() => fileInputRef.current?.click()}
                              style={{ aspectRatio: '1', borderRadius: 8, border: '2px dashed #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#9ca3af', fontSize: 22 }}>+</div>
                          )}
                        </div>
                      )}
                      {imagePreviews.length > 0 && (
                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>
                          {imagePreviews.length}/5 ảnh • Ảnh đầu tiên sẽ làm ảnh bìa
                        </div>
                      )}
                    </div>
                    {/* ===== PDF UPLOAD ===== */}
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                        📄 File PDF Ebook
                        <span style={{ fontSize: 11, fontWeight: 400, color: '#6b7280', marginLeft: 6 }}>(Chỉ seller và người đã mua mới xem được)</span>
                      </label>
                      {!pdfFile ? (
                        <div onClick={() => pdfInputRef.current?.click()}
                          style={{ border: '2px dashed #e5e7eb', borderRadius: 10, padding: '20px', textAlign: 'center', cursor: 'pointer', background: '#f9fafb' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = '#f59e0b'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}>
                          <div style={{ fontSize: 28, marginBottom: 6 }}>📄</div>
                          <div style={{ fontSize: 13, color: '#6b7280' }}>Click để chọn file PDF</div>
                          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Tối đa 20MB • Chỉ file .pdf</div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#fffbeb', border: '1.5px solid #fbbf24', borderRadius: 8 }}>
                          <span style={{ fontSize: 20 }}>📄</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{pdfFile.name}</div>
                            <div style={{ fontSize: 11, color: '#9ca3af' }}>{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</div>
                          </div>
                          <button type="button" onClick={() => setPdfFile(null)}
                            style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>✕ Xóa</button>
                        </div>
                      )}
                      <input ref={pdfInputRef} type="file" accept="application/pdf" style={{ display: 'none' }}
                        onChange={e => { if (e.target.files[0]) setPdfFile(e.target.files[0]); }} />
                    </div>
                    <button type="submit" disabled={saving || uploading || pdfUploading} style={{ width: '100%', padding: 12, background: 'var(--primary)', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.8 : 1 }}>
                      {pdfUploading ? '📤 Đang upload PDF...' : uploading ? '☁️ Đang upload ảnh...' : saving ? '⏳ Đang tạo...' : <><FaCheck /> Tạo E-book</>}
                    </button>
                  </form>
                </div>
              </div>
            )}

          </>)}
        </main>
      </div>

      {/* ===== EDIT MODAL ===== */}
      {editEbook && (
        <>
          {/* Backdrop */}
          <div onClick={() => setEditEbook(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200 }} />
          {/* Panel */}
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 480, background: 'white', zIndex: 201, overflowY: 'auto', boxShadow: '-4px 0 24px rgba(0,0,0,0.12)' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 17 }}>Chỉnh sửa E-book</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>ID: {editEbook._id.slice(-8).toUpperCase()}</div>
              </div>
              <button onClick={() => setEditEbook(null)} style={{ width: 32, height: 32, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#374151' }}>
                <FaTimes size={14} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdate} style={{ padding: 24 }}>
              {[
                { label: 'Tiêu đề *', key: 'title', req: true },
                { label: 'Địa điểm *', key: 'location', req: true },
                { label: 'Thời gian', key: 'duration', req: false },
                { label: 'Tags (cách bởi dấu phẩy)', key: 'tags', req: false },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{f.label}</label>
                  <input value={editForm[f.key] || ''} onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })} required={f.req}
                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
                </div>
              ))}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Danh mục</label>
                  <select value={editForm.category || 'mien-trung'} onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', background: 'white', fontFamily: 'inherit' }}>
                    {[['mien-bac','Miền Bắc'],['mien-trung','Miền Trung'],['mien-nam','Miền Nam'],['tay-nguyen','Tây Nguyên'],['dao-bien','Đảo & Biển'],['nuoc-ngoai','Nước ngoài']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Badge</label>
                  <select value={editForm.badge || ''} onChange={e => setEditForm({ ...editForm, badge: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', background: 'white', fontFamily: 'inherit' }}>
                    <option value="">Không có</option>
                    <option value="hot">🔥 HOT</option>
                    <option value="new">✨ MỚI</option>
                    <option value="best">⭐ BEST SELLER</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Giá (VNĐ) *</label>
                <input type="number" value={editForm.price || ''} onChange={e => setEditForm({ ...editForm, price: e.target.value })} required
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Mô tả *</label>
                <textarea value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} required
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, minHeight: 120, resize: 'vertical', outline: 'none', fontFamily: 'inherit' }} />
              </div>

              {/* Current images */}
              {editEbook.images?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Ảnh hiện tại</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {editEbook.images.map((img, i) => (
                      <div key={i} style={{ width: 64, height: 64, borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb', position: 'relative' }}>
                        <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {i === 0 && <span style={{ position: 'absolute', bottom: 2, left: 2, background: 'var(--primary)', color: 'white', fontSize: 8, padding: '1px 4px', borderRadius: 2 }}>Bìa</span>}
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>Để thay ảnh mới, xóa ebook và tạo lại hoặc liên hệ hỗ trợ.</div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setEditEbook(null)}
                  style={{ flex: 1, padding: 12, border: '1.5px solid #e5e7eb', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer', background: 'white' }}>
                  Hủy
                </button>
                <button type="submit" disabled={editSaving}
                  style={{ flex: 2, padding: 12, background: 'var(--primary)', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {editSaving ? '⏳ Đang lưu...' : <><FaCheck /> Lưu thay đổi</>}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* ===== REJECT MODAL ===== */}
      {rejectModal && (
        <>
          <div onClick={() => setRejectModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 300 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'white', borderRadius: 14, padding: 28, width: 440, zIndex: 301, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 6 }}>Từ chối {rejectModal.type === 'app' ? 'đơn đối tác' : 'ebook'}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
              {rejectModal.type === 'app' ? 'Người dùng' : 'Ebook'}: <strong>{rejectModal.title}</strong>
            </div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Lý do từ chối *</label>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="Nhập lý do cụ thể để người dùng có thể cải thiện..."
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, minHeight: 100, resize: 'vertical', outline: 'none', fontFamily: 'inherit', marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => { setRejectModal(null); setRejectReason(''); }}
                style={{ flex: 1, padding: 11, border: '1.5px solid #e5e7eb', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer', background: 'white' }}>
                Hủy
              </button>
              <button type="button" disabled={!rejectReason.trim()} onClick={async () => {
                if (rejectModal.type === 'app') {
                  await api.put(`/partner/admin/applications/${rejectModal.id}/reject`, { reason: rejectReason });
                  setPartnerApps(prev => prev.map(a => a._id === rejectModal.id ? { ...a, status: 'rejected', rejectedReason: rejectReason } : a));
                } else {
                  await api.put(`/partner/admin/ebooks/${rejectModal.id}/reject`, { reason: rejectReason });
                  setPendingEbooks(prev => prev.filter(e => e._id !== rejectModal.id));
                }
                setRejectModal(null); setRejectReason('');
                alert('Đã từ chối và gửi email thông báo!');
              }} style={{ flex: 2, padding: 11, background: rejectReason.trim() ? '#dc2626' : '#9ca3af', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: rejectReason.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <FaTimes /> Xác nhận từ chối
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
