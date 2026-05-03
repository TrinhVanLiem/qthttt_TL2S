const PartnerApplication = require('../models/PartnerApplication');
const User = require('../models/User');
const Ebook = require('../models/Ebook');
const { sendMail } = require('../utils/emailService');

// ===== USER: Nộp đơn đăng ký đối tác =====
const applyPartner = async (req, res) => {
  try {
    const existing = await PartnerApplication.findOne({ user: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'Bạn đã nộp đơn đăng ký đối tác rồi', application: existing });
    }
    const app = await PartnerApplication.create({ ...req.body, user: req.user._id });
    // Cập nhật partnerStatus của user
    await User.findByIdAndUpdate(req.user._id, { partnerStatus: 'pending' });
    res.status(201).json(app);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===== USER: Xem đơn của mình =====
const getMyApplication = async (req, res) => {
  try {
    const app = await PartnerApplication.findOne({ user: req.user._id });
    res.json(app || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===== PARTNER: Lấy danh sách ebook của mình =====
const getMyEbooks = async (req, res) => {
  try {
    const ebooks = await Ebook.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.json(ebooks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===== PARTNER: Tạo ebook mới (cần admin duyệt) =====
const createPartnerEbook = async (req, res) => {
  try {
    const app = await PartnerApplication.findOne({ user: req.user._id, status: 'approved' });
    if (!app) return res.status(403).json({ message: 'Bạn chưa được duyệt làm đối tác' });

    const tags = Array.isArray(req.body.tags) ? req.body.tags : (req.body.tags || '').split(',').map(t => t.trim()).filter(Boolean);
    const ebook = await Ebook.create({
      ...req.body,
      tags,
      seller: req.user._id,
      isApproved: false,
      approvalStatus: 'pending',
      commissionRate: app.commissionRate,
    });
    res.status(201).json(ebook);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===== PARTNER: Thống kê doanh thu =====
const getPartnerStats = async (req, res) => {
  try {
    const ebooks = await Ebook.find({ seller: req.user._id, approvalStatus: 'approved' });
    const totalSales = ebooks.reduce((s, e) => s + (e.sales || 0), 0);
    const totalRevenue = ebooks.reduce((s, e) => s + (e.sales || 0) * e.price, 0);
    const app = await PartnerApplication.findOne({ user: req.user._id });
    const commission = app ? app.commissionRate : 70;
    res.json({
      totalEbooks: ebooks.length,
      totalSales,
      totalRevenue,
      partnerRevenue: Math.round(totalRevenue * commission / 100),
      commissionRate: commission,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===== ADMIN: Xem tất cả đơn đăng ký =====
const getAllApplications = async (req, res) => {
  try {
    const apps = await PartnerApplication.find()
      .populate('user', 'name email')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===== ADMIN: Duyệt đơn =====
const approveApplication = async (req, res) => {
  try {
    const app = await PartnerApplication.findById(req.params.id).populate('user', 'name email');
    if (!app) return res.status(404).json({ message: 'Không tìm thấy đơn' });

    app.status = 'approved';
    app.reviewedBy = req.user._id;
    app.reviewedAt = new Date();
    await app.save();

    await User.findByIdAndUpdate(app.user._id, { role: 'partner', partnerStatus: 'approved' });

    // Gửi email
    await sendMail({
      to: app.user.email,
      subject: 'Đơn đăng ký Đối tác đã được duyệt!',
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:auto">
          <h2 style="color:#2a9d5c">Chào mừng bạn trở thành Đối tác!</h2>
          <p>Xin chào <strong>${app.user.name}</strong>,</p>
          <p>Đơn đăng ký đối tác của bạn đã được <strong>phê duyệt</strong>. Bạn có thể bắt đầu đăng tải ebook ngay bây giờ.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/partner" 
             style="display:inline-block;background:#2a9d5c;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700">
            Vào Partner Dashboard
          </a>
          <p style="color:#6b7280;font-size:13px;margin-top:20px">Hoa hồng của bạn: ${app.commissionRate}% trên mỗi đơn hàng</p>
        </div>`,
    });

    res.json({ message: 'Đã duyệt đơn và cấp quyền đối tác', application: app });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===== ADMIN: Từ chối đơn =====
const rejectApplication = async (req, res) => {
  try {
    const { reason } = req.body;
    const app = await PartnerApplication.findById(req.params.id).populate('user', 'name email');
    if (!app) return res.status(404).json({ message: 'Không tìm thấy đơn' });

    app.status = 'rejected';
    app.rejectedReason = reason || 'Không đáp ứng yêu cầu';
    app.reviewedBy = req.user._id;
    app.reviewedAt = new Date();
    await app.save();

    await User.findByIdAndUpdate(app.user._id, { partnerStatus: 'rejected' });

    await sendMail({
      to: app.user.email,
      subject: 'Thông báo về đơn đăng ký Đối tác',
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:auto">
          <h2 style="color:#ef4444">Đơn đăng ký Đối tác chưa được duyệt</h2>
          <p>Xin chào <strong>${app.user.name}</strong>,</p>
          <p>Rất tiếc, đơn đăng ký đối tác của bạn chưa được chấp thuận lần này.</p>
          <p><strong>Lý do:</strong> ${app.rejectedReason}</p>
          <p>Bạn có thể liên hệ với chúng tôi để được hỗ trợ thêm.</p>
        </div>`,
    });

    res.json({ message: 'Đã từ chối đơn', application: app });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===== ADMIN: Xem ebook đang chờ duyệt =====
const getPendingEbooks = async (req, res) => {
  try {
    const ebooks = await Ebook.find({ approvalStatus: 'pending' })
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });
    res.json(ebooks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===== ADMIN: Duyệt ebook =====
const approveEbook = async (req, res) => {
  try {
    const ebook = await Ebook.findById(req.params.id).populate('seller', 'name email');
    if (!ebook) return res.status(404).json({ message: 'Không tìm thấy ebook' });

    ebook.isApproved = true;
    ebook.approvalStatus = 'approved';
    ebook.rejectedReason = '';
    await ebook.save();

    await sendMail({
      to: ebook.seller.email,
      subject: 'Ebook của bạn đã được duyệt!',
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:auto">
          <h2 style="color:#2a9d5c">Ebook đã được phê duyệt</h2>
          <p>Xin chào <strong>${ebook.seller.name}</strong>,</p>
          <p>Ebook <strong>"${ebook.title}"</strong> của bạn đã được duyệt và hiển thị trên hệ thống.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/partner"
             style="display:inline-block;background:#2a9d5c;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700">
            Xem trên Partner Dashboard
          </a>
        </div>`,
    });

    res.json({ message: 'Đã duyệt ebook', ebook });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===== ADMIN: Từ chối ebook =====
const rejectEbook = async (req, res) => {
  try {
    const { reason } = req.body;
    const ebook = await Ebook.findById(req.params.id).populate('seller', 'name email');
    if (!ebook) return res.status(404).json({ message: 'Không tìm thấy ebook' });

    ebook.isApproved = false;
    ebook.approvalStatus = 'rejected';
    ebook.rejectedReason = reason || 'Không đáp ứng tiêu chuẩn nội dung';
    await ebook.save();

    await sendMail({
      to: ebook.seller.email,
      subject: 'Thông báo về Ebook của bạn',
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:auto">
          <h2 style="color:#ef4444">Ebook chưa được duyệt</h2>
          <p>Xin chào <strong>${ebook.seller.name}</strong>,</p>
          <p>Ebook <strong>"${ebook.title}"</strong> chưa được chấp thuận.</p>
          <p><strong>Lý do:</strong> ${ebook.rejectedReason}</p>
          <p>Bạn có thể chỉnh sửa và gửi lại để xem xét.</p>
        </div>`,
    });

    res.json({ message: 'Đã từ chối ebook', ebook });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  applyPartner, getMyApplication, getMyEbooks, createPartnerEbook, getPartnerStats,
  getAllApplications, approveApplication, rejectApplication,
  getPendingEbooks, approveEbook, rejectEbook,
};
