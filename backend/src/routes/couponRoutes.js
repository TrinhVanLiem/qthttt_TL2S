const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// ─── ADMIN: Tạo mã mới ────────────────────────────────────────────────────────
// POST /api/coupons
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { code, discount, type, minOrder, expiry, active, usageLimit } = req.body;
    if (!code || !discount) return res.status(400).json({ message: 'Thiếu code hoặc discount' });

    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      discount: Number(discount),
      type: type || 'percent',
      minOrder: Number(minOrder) || 0,
      expiry: expiry ? new Date(expiry) : null,
      active: active !== false,
      usageLimit: usageLimit ? Number(usageLimit) : null,
    });
    res.status(201).json(coupon);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Mã này đã tồn tại' });
    res.status(500).json({ message: err.message });
  }
});

// ─── ADMIN: Lấy tất cả mã ────────────────────────────────────────────────────
// GET /api/coupons
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── PUBLIC: Lấy mã đang active (hiện trên Dashboard user) ──────────────────
// GET /api/coupons/active
router.get('/active', async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      active: true,
      $and: [
        { $or: [{ expiry: null }, { expiry: { $gt: now } }] },
        { $or: [{ usageLimit: null }, { $expr: { $lt: ['$usedCount', '$usageLimit'] } }] },
      ],
    }).select('code discount type minOrder expiry').sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── USER: Validate mã giảm giá ──────────────────────────────────────────────
// POST /api/coupons/validate
router.post('/validate', protect, async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    if (!code) return res.status(400).json({ message: 'Vui lòng nhập mã giảm giá' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

    if (!coupon) return res.status(404).json({ message: 'Mã giảm giá không tồn tại' });
    if (!coupon.active) return res.status(400).json({ message: 'Mã giảm giá đã bị vô hiệu hoá' });
    if (coupon.expiry && new Date(coupon.expiry) < new Date())
      return res.status(400).json({ message: 'Mã giảm giá đã hết hạn' });
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit)
      return res.status(400).json({ message: 'Mã giảm giá đã hết lượt sử dụng' });
    if (orderTotal < coupon.minOrder)
      return res.status(400).json({
        message: `Đơn hàng tối thiểu ${coupon.minOrder.toLocaleString('vi-VN')}đ để dùng mã này`,
      });

    // Tính số tiền giảm
    let discountAmount = 0;
    if (coupon.type === 'percent') {
      discountAmount = Math.round((orderTotal * coupon.discount) / 100);
    } else {
      discountAmount = Math.min(coupon.discount, orderTotal);
    }

    res.json({
      valid: true,
      code: coupon.code,
      discountAmount,
      type: coupon.type,
      discount: coupon.discount,
      message: `Áp dụng thành công! Giảm ${coupon.type === 'percent' ? coupon.discount + '%' : coupon.discount.toLocaleString('vi-VN') + 'đ'}`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── ADMIN: Cập nhật (bật/tắt, sửa) ─────────────────────────────────────────
// PUT /api/coupons/:id
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ message: 'Không tìm thấy mã' });
    res.json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── ADMIN: Xóa mã ───────────────────────────────────────────────────────────
// DELETE /api/coupons/:id
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa mã giảm giá' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
