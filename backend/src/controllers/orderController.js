const Order = require('../models/Order');
const Ebook = require('../models/Ebook');
const User = require('../models/User');
const { sendOrderConfirmation } = require('../utils/emailService');

// @route   POST /api/orders
// @desc    Tạo đơn hàng mới (mock payment)
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { items } = req.body; // items: [{ ebookId }]

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng trống' });
    }

    // Lấy thông tin e-book và tính tổng tiền
    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const ebook = await Ebook.findById(item.ebookId);
      if (!ebook) return res.status(404).json({ message: `Không tìm thấy e-book: ${item.ebookId}` });

      orderItems.push({
        ebook: ebook._id,
        price: ebook.price,
        title: ebook.title,
        thumbnail: ebook.thumbnail,
      });
      totalAmount += ebook.price;

      // Tăng số lượng bán — dùng updateOne để bỏ qua validate seller
      await Ebook.updateOne({ _id: ebook._id }, { $inc: { sales: 1 } });
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      paymentMethod: req.body.paymentMethod || 'mock',
    });

    // Gửi email xác nhận (bất đồng bộ — không block response)
    const user = await User.findById(req.user._id).select('name email');
    sendOrderConfirmation({
      to: user.email,
      name: user.name,
      orderId: order._id,
      items: orderItems,
      totalAmount,
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/orders/my
// @desc    Lịch sử đơn hàng của user
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.ebook', 'title thumbnail');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/orders
// @desc    Lấy tất cả đơn hàng (Admin)
// @access  Admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .populate('items.ebook', 'title');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/orders/stats
// @desc    Thống kê doanh thu (Admin Dashboard)
// @access  Admin
const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    // Doanh thu theo tháng (6 tháng gần nhất)
    const monthlyRevenue = await Order.aggregate([
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 },
    ]);

    res.json({
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      monthlyRevenue: monthlyRevenue.reverse(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, getMyOrders, getAllOrders, getOrderStats };
