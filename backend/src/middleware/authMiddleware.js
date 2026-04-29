const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware kiểm tra đã đăng nhập chưa
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token không hợp lệ, vui lòng đăng nhập lại' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Bạn chưa đăng nhập' });
  }
};

// Middleware kiểm tra quyền Admin
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này' });
  }
};

module.exports = { protect, adminOnly };
