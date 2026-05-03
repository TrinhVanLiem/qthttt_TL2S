const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Review = require('../models/Review');
const bcrypt = require('bcryptjs');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// GET /api/users — Lấy tất cả users (Admin only)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/users/:id — Xóa user (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa người dùng' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/me — Lấy thông tin bản thân
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/me — Cập nhật thông tin (tên, avatar)
router.put('/me', protect, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { ...(name && { name }), ...(avatar && { avatar }) },
      { new: true, runValidators: true }
    ).select('-password');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/me/password — Đổi mật khẩu
router.put('/me/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Vui lòng nhập đủ thông tin' });
    if (newPassword.length < 6)
      return res.status(400).json({ message: 'Mật khẩu mới phải ít nhất 6 ký tự' });

    const user = await User.findById(req.user._id);
    // Tài khoản Google OAuth không có password
    if (!user.password)
      return res.status(400).json({ message: 'Tài khoản Google không dùng chức năng này' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Mật khẩu hiện tại không đúng' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Đổi mật khẩu thành công!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/my-reviews — Lấy đánh giá của bản thân
router.get('/my-reviews', protect, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('ebook', 'title thumbnail')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
