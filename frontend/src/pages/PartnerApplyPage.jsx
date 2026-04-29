import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TopBar, Navbar, Footer } from '../components/Layout';
import {
  FaHandshake, FaUser, FaIdCard, FaPhone, FaMapMarkerAlt,
  FaUniversity, FaFileAlt, FaCloudUploadAlt, FaCheck, FaArrowLeft, FaTimes
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const BANKS = ['Vietcombank', 'Techcombank', 'BIDV', 'VietinBank', 'MB Bank', 'TPBank', 'ACB', 'Sacombank', 'VPBank', 'SHB', 'Agribank', 'OCB', 'HDBank'];

const STEPS = ['Thông tin cá nhân', 'Thông tin ngân hàng', 'Ebook mẫu'];

export default function PartnerApplyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const pdfRef = useRef(null);

  const [form, setForm] = useState({
    fullName: user?.name || '',
    dateOfBirth: '',
    phone: '',
    address: '',
    idNumber: '',
    bio: '',
    bankName: 'Vietcombank',
    bankAccount: '',
    bankHolder: '',
    sampleTitle: '',
    sampleDescription: '',
    sampleFileUrl: '',
    samplePublicId: '',
  });

  const [pdfFile, setPdfFile] = useState(null);
  const [pdfName, setPdfName] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handlePickPdf = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) { alert('File PDF tối đa 20MB!'); return; }
    setPdfFile(file);
    setPdfName(file.name);
    set('sampleFileUrl', ''); // reset khi chọn file mới
  };

  const uploadPdf = async () => {
    if (!pdfFile) return form.sampleFileUrl;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('pdf', pdfFile);
      const { data } = await api.post('/upload/pdf', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      set('sampleFileUrl', data.url);
      set('samplePublicId', data.publicId);
      return data.url;
    } catch (err) {
      alert('Lỗi upload PDF: ' + (err.response?.data?.message || err.message));
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pdfFile && !form.sampleFileUrl) { alert('Vui lòng upload ebook mẫu PDF!'); return; }
    setSaving(true);
    try {
      let fileUrl = form.sampleFileUrl;
      if (pdfFile) {
        fileUrl = await uploadPdf();
        if (!fileUrl) { setSaving(false); return; }
      }
      await api.post('/partner/apply', { ...form, sampleFileUrl: fileUrl });
      alert('✅ Đã nộp đơn đăng ký đối tác! Admin sẽ xem xét trong 1-3 ngày làm việc.');
      navigate('/profile');
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi nộp đơn');
    } finally {
      setSaving(false);
    }
  };

  const canNext0 = form.fullName && form.dateOfBirth && form.phone && form.address && form.idNumber;
  const canNext1 = form.bankName && form.bankAccount && form.bankHolder;
  const canSubmit = form.sampleTitle && form.sampleDescription && (pdfFile || form.sampleFileUrl);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f4f6f8' }}>
      <TopBar />
      <Navbar />

      {/* BREADCRUMB */}
      <div style={{ background: '#f8fafb', borderBottom: '1px solid var(--border)', padding: '10px 0', fontSize: 13 }}>
        <div className="container" style={{ display: 'flex', gap: 6, color: 'var(--text-gray)', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'var(--primary)' }}>Trang chủ</Link> ›
          <Link to="/profile" style={{ color: 'var(--primary)' }}>Tài khoản</Link> ›
          <span>Đăng ký Đối tác</span>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 20px 60px', flex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <button onClick={() => navigate('/profile')}
            style={{ width: 38, height: 38, borderRadius: '50%', border: '1.5px solid var(--border)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-dark)' }}>
            <FaArrowLeft size={14} />
          </button>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 2 }}>Đăng ký Đối tác</h1>
            <p style={{ fontSize: 13, color: 'var(--text-gray)' }}>Trở thành đối tác để đăng tải và kiếm thu nhập từ ebook du lịch</p>
          </div>
        </div>

        {/* Benefit banner */}
        <div style={{ background: 'linear-gradient(135deg,#1B6B4A,#2a9d5c)', borderRadius: 14, padding: '20px 28px', marginBottom: 28, color: 'white', display: 'flex', gap: 32, alignItems: 'center' }}>
          {[['70%', 'Hoa hồng mỗi đơn'], ['∞', 'Không giới hạn ebook'], ['24/7', 'Hỗ trợ ưu tiên']].map(([v, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 900 }}>{v}</div>
              <div style={{ fontSize: 12, opacity: 0.85 }}>{l}</div>
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 11, opacity: 0.75, maxWidth: 200 }}>
            Đăng ký miễn phí. Admin xét duyệt trong 1-3 ngày làm việc.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, alignItems: 'flex-start' }}>

          {/* Steps sidebar */}
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: i < 2 ? '1px solid var(--border)' : 'none', background: step === i ? '#f0faf5' : 'white', cursor: i < step ? 'pointer' : 'default' }}
                onClick={() => { if (i < step) setStep(i); }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: i < step ? 'var(--primary)' : step === i ? 'var(--primary)' : '#e5e7eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  {i < step ? <FaCheck size={11} /> : i + 1}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: step === i ? 700 : 500, color: step === i ? 'var(--primary)' : i < step ? 'var(--text-dark)' : '#9ca3af' }}>
                    Bước {i + 1}
                  </div>
                  <div style={{ fontSize: 12, color: step === i ? 'var(--primary)' : '#9ca3af' }}>{s}</div>
                </div>
              </div>
            ))}

            {/* Info box */}
            <div style={{ padding: '16px 18px', background: '#f8fafb', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, color: 'var(--text-gray)', lineHeight: 1.7 }}>
                <div style={{ fontWeight: 700, marginBottom: 4, color: 'var(--text-dark)' }}>Lưu ý:</div>
                <div>• File PDF mẫu tối đa 20MB</div>
                <div>• Thông tin ngân hàng để nhận hoa hồng</div>
                <div>• Admin sẽ xét duyệt trong 1-3 ngày</div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>

              {/* Step header */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', background: '#fafafa', display: 'flex', alignItems: 'center', gap: 10 }}>
                {step === 0 && <FaUser size={16} color="var(--primary)" />}
                {step === 1 && <FaUniversity size={16} color="var(--primary)" />}
                {step === 2 && <FaFileAlt size={16} color="var(--primary)" />}
                <div style={{ fontWeight: 700, fontSize: 16 }}>
                  {step === 0 && 'Thông tin cá nhân'}
                  {step === 1 && 'Thông tin ngân hàng'}
                  {step === 2 && 'Ebook mẫu (để Admin kiểm duyệt)'}
                </div>
              </div>

              <div style={{ padding: 24 }}>

                {/* ===== STEP 0 ===== */}
                {step === 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                    {[
                      { label: 'Họ và tên *', key: 'fullName', icon: <FaUser />, placeholder: 'Nguyễn Văn A', full: false },
                      { label: 'Ngày sinh *', key: 'dateOfBirth', type: 'date', full: false },
                      { label: 'Số điện thoại *', key: 'phone', icon: <FaPhone />, placeholder: '0912 345 678', full: false },
                      { label: 'Số CCCD/CMND *', key: 'idNumber', icon: <FaIdCard />, placeholder: '0123456789xx', full: false },
                      { label: 'Địa chỉ *', key: 'address', icon: <FaMapMarkerAlt />, placeholder: 'Số nhà, đường, phường, quận, tỉnh/thành phố', full: true },
                    ].map(f => (
                      <div key={f.key} style={{ gridColumn: f.full ? '1/-1' : 'auto' }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{f.label}</label>
                        <input type={f.type || 'text'} value={form[f.key]} onChange={e => set(f.key, e.target.value)}
                          placeholder={f.placeholder} required
                          style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
                      </div>
                    ))}
                    <div style={{ gridColumn: '1/-1' }}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Giới thiệu bản thân</label>
                      <textarea value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Kinh nghiệm du lịch, lý do muốn trở thành đối tác..."
                        style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, minHeight: 100, resize: 'vertical', outline: 'none', fontFamily: 'inherit' }} />
                    </div>
                  </div>
                )}

                {/* ===== STEP 1 ===== */}
                {step === 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#92400e' }}>
                      💡 Thông tin ngân hàng chỉ để xác minh danh tính và liên hệ khi thanh toán hoa hồng. Chúng tôi không lưu trữ thẻ tín dụng.
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Ngân hàng *</label>
                      <select value={form.bankName} onChange={e => set('bankName', e.target.value)} required
                        style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', background: 'white', fontFamily: 'inherit' }}>
                        {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Số tài khoản *</label>
                      <input value={form.bankAccount} onChange={e => set('bankAccount', e.target.value)} placeholder="VD: 1234567890" required
                        style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Tên chủ tài khoản *</label>
                      <input value={form.bankHolder} onChange={e => set('bankHolder', e.target.value)} placeholder="VD: NGUYEN VAN A (in hoa, không dấu)" required
                        style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Nhập đúng tên như in trên thẻ ngân hàng</div>
                    </div>
                  </div>
                )}

                {/* ===== STEP 2 ===== */}
                {step === 2 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div style={{ background: '#f0faf5', border: '1px solid #6ee7b7', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#065f46' }}>
                      📚 Ebook mẫu giúp Admin đánh giá chất lượng nội dung của bạn. Đây là bước quan trọng để được duyệt.
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Tiêu đề ebook mẫu *</label>
                      <input value={form.sampleTitle} onChange={e => set('sampleTitle', e.target.value)} placeholder="VD: Guide Đà Lạt 3N2Đ chi tiết" required
                        style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Mô tả ngắn *</label>
                      <textarea value={form.sampleDescription} onChange={e => set('sampleDescription', e.target.value)}
                        placeholder="Nội dung chính của ebook: lịch trình, địa điểm, ngân sách..." required
                        style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, minHeight: 100, resize: 'vertical', outline: 'none', fontFamily: 'inherit' }} />
                    </div>

                    {/* PDF Upload */}
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>File PDF mẫu * (tối đa 20MB)</label>
                      <input ref={pdfRef} type="file" accept="application/pdf" onChange={handlePickPdf} style={{ display: 'none' }} />
                      {!pdfFile ? (
                        <div onClick={() => pdfRef.current?.click()}
                          style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: '32px 20px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s', background: '#fafafa' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                          <FaCloudUploadAlt size={36} color="var(--primary)" style={{ marginBottom: 8, opacity: 0.7 }} />
                          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Kéo thả hoặc click để chọn file PDF</div>
                          <div style={{ fontSize: 12, color: 'var(--text-gray)' }}>Chấp nhận file .pdf, tối đa 20MB</div>
                        </div>
                      ) : (
                        <div style={{ border: '1.5px solid #6ee7b7', borderRadius: 10, padding: '14px 18px', background: '#f0faf5', display: 'flex', alignItems: 'center', gap: 12 }}>
                          <FaFileAlt size={24} color="var(--primary)" />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{pdfName}</div>
                            <div style={{ fontSize: 12, color: '#059669' }}>{(pdfFile.size / 1024 / 1024).toFixed(1)} MB</div>
                          </div>
                          <button type="button" onClick={() => { setPdfFile(null); setPdfName(''); set('sampleFileUrl', ''); }}
                            style={{ width: 28, height: 28, borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <FaTimes size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Navigation buttons */}
                <div style={{ display: 'flex', gap: 12, marginTop: 28, justifyContent: 'space-between' }}>
                  <button type="button" onClick={() => step === 0 ? navigate('/profile') : setStep(step - 1)}
                    style={{ padding: '11px 24px', border: '1.5px solid var(--border)', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer', background: 'white', color: 'var(--text-dark)' }}>
                    {step === 0 ? 'Hủy' : '← Quay lại'}
                  </button>
                  {step < 2 ? (
                    <button type="button"
                      disabled={step === 0 ? !canNext0 : !canNext1}
                      onClick={() => setStep(step + 1)}
                      style={{ padding: '11px 28px', background: (step === 0 ? canNext0 : canNext1) ? 'var(--primary)' : '#9ca3af', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: (step === 0 ? canNext0 : canNext1) ? 'pointer' : 'not-allowed' }}>
                      Tiếp theo →
                    </button>
                  ) : (
                    <button type="submit" disabled={!canSubmit || saving || uploading}
                      style={{ padding: '11px 28px', background: canSubmit ? 'var(--primary)' : '#9ca3af', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: canSubmit ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 8 }}>
                      {uploading ? '☁️ Đang upload PDF...' : saving ? '⏳ Đang nộp đơn...' : <><FaCheck /> Nộp đơn đăng ký</>}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
