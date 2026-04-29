const Cart = require('../models/Cart');

// GET /api/cart — lấy giỏ hàng của user hiện tại
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.ebook', 'title price location duration badge rating');
    if (!cart) return res.json({ items: [] });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/cart/add — thêm ebook vào giỏ
const addToCart = async (req, res) => {
  try {
    const { ebookId, quantity = 1 } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existing = cart.items.find(i => i.ebook.toString() === ebookId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ ebook: ebookId, quantity });
    }

    await cart.save();
    const populated = await cart.populate('items.ebook', 'title price location duration badge rating');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/cart/remove/:ebookId — xóa 1 item khỏi giỏ
const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });

    cart.items = cart.items.filter(i => i.ebook.toString() !== req.params.ebookId);
    await cart.save();
    const populated = await cart.populate('items.ebook', 'title price location duration badge rating');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/cart/sync — đồng bộ toàn bộ giỏ (dùng khi đăng nhập)
const syncCart = async (req, res) => {
  try {
    const { items } = req.body; // [{ ebookId, quantity }]
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    for (const { ebookId, quantity } of items) {
      const existing = cart.items.find(i => i.ebook.toString() === ebookId);
      if (!existing) cart.items.push({ ebook: ebookId, quantity: quantity || 1 });
    }

    await cart.save();
    const populated = await cart.populate('items.ebook', 'title price location duration badge rating');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/cart/clear — xóa toàn bộ giỏ
const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    res.json({ items: [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getCart, addToCart, removeFromCart, syncCart, clearCart };
