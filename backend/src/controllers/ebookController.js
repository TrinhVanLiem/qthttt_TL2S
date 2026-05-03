const Ebook = require('../models/Ebook');
const Review = require('../models/Review');
const mongoose = require('mongoose');

// @route   GET /api/ebooks
// @desc    Lấy danh sách e-book (có filter & search)
// @access  Public
const getEbooks = async (req, res) => {
  try {
    const { keyword, category, location, minPrice, maxPrice, sort } = req.query;

    let filter = {};

    // Tìm theo từ khóa
    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { location: { $regex: keyword, $options: 'i' } },
        { tags: { $in: [new RegExp(keyword, 'i')] } },
      ];
    }

    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Sắp xếp
    let sortOption = { createdAt: -1 }; // Mặc định: mới nhất
    if (sort === 'price-asc') sortOption = { price: 1 };
    if (sort === 'price-desc') sortOption = { price: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    if (sort === 'sales') sortOption = { sales: -1 };

    const ebooks = await Ebook.find(filter)
      .sort(sortOption)
      .populate('seller', 'name avatar');

    res.json(ebooks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/ebooks/:id
// @desc    Lấy chi tiết 1 e-book
// @access  Public
const getEbookById = async (req, res) => {
  try {
    const ebook = await Ebook.findById(req.params.id).populate('seller', 'name avatar');
    if (!ebook) return res.status(404).json({ message: 'Không tìm thấy e-book' });

    // Lấy kèm reviews
    const reviews = await Review.find({ ebook: req.params.id })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ ...ebook._doc, reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/ebooks
// @desc    Tạo e-book mới (Admin)
// @access  Admin
const createEbook = async (req, res) => {
  try {
    const ebook = await Ebook.create({ ...req.body, seller: req.user._id });
    res.status(201).json(ebook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/ebooks/:id
// @desc    Cập nhật e-book (Admin)
// @access  Admin
const updateEbook = async (req, res) => {
  try {
    const ebook = await Ebook.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!ebook) return res.status(404).json({ message: 'Không tìm thấy e-book' });
    res.json(ebook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/ebooks/:id
// @desc    Xoá e-book (Admin)
// @access  Admin
const deleteEbook = async (req, res) => {
  try {
    const ebook = await Ebook.findByIdAndDelete(req.params.id);
    if (!ebook) return res.status(404).json({ message: 'Không tìm thấy e-book' });
    res.json({ message: 'Đã xoá e-book thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/ebooks/:id/reviews
// @desc    Thêm đánh giá cho e-book
// @access  Private
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const ebook = await Ebook.findById(req.params.id);
    if (!ebook) return res.status(404).json({ message: 'Không tìm thấy e-book' });

    // Kiểm tra đã review chưa
    const existing = await Review.findOne({ user: req.user._id, ebook: req.params.id });
    if (existing) return res.status(400).json({ message: 'Bạn đã đánh giá e-book này rồi' });

    const review = await Review.create({ user: req.user._id, ebook: req.params.id, rating, comment });

    // Cập nhật rating trung bình
    const reviews = await Review.find({ ebook: req.params.id });
    ebook.numReviews = reviews.length;
    ebook.rating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    await ebook.save();

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/ebooks/admin/reviews
// @desc    Lấy tất cả đánh giá (admin)
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email avatar')
      .populate('ebook', 'title seller')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// @route   DELETE /api/ebooks/admin/reviews/:id
// @desc    Xóa đánh giá (admin)
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate('ebook');
    if (!review) return res.status(404).json({ message: 'Không tìm thấy đánh giá' });

    await review.deleteOne();

    // Cập nhật lại rating của ebook
    const ebook = await Ebook.findById(review.ebook._id);
    if (ebook) {
      const remaining = await Review.find({ ebook: ebook._id });
      ebook.numReviews = remaining.length;
      ebook.rating = remaining.length > 0
        ? remaining.reduce((s, r) => s + r.rating, 0) / remaining.length
        : 0;
      await ebook.save();
    }
    res.json({ message: 'Đã xóa đánh giá' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// @route   GET /api/ebooks/partner/my-reviews
// @desc    Partner xem reviews của ebook họ sở hữu
const getMyEbookReviews = async (req, res) => {
  try {
    const myEbooks = await Ebook.find({ seller: req.user._id }).select('_id title');
    const ebookIds = myEbooks.map(e => e._id);
    const reviews = await Review.find({ ebook: { $in: ebookIds } })
      .populate('user', 'name avatar')
      .populate('ebook', 'title')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// @route   GET /api/ebooks/:id/pdf
// @desc    Trả về URL PDF — chỉ cho seller, admin, và người đã mua
// @access  Private
const getPdfAccess = async (req, res) => {
  try {
    const Order = require('../models/Order');
    const ebook = await Ebook.findById(req.params.id);
    if (!ebook) return res.status(404).json({ message: 'Không tìm thấy ebook' });
    if (!ebook.fileUrl) return res.status(404).json({ message: 'Ebook này chưa có file PDF' });

    const userId = req.user._id.toString();
    const isAdmin  = req.user.role === 'admin';
    const isSeller = ebook.seller.toString() === userId;

    // Kiểm tra đã mua chưa
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      'items.ebook': ebook._id,
      status: { $in: ['paid', 'completed'] },
    });

    if (!isAdmin && !isSeller && !hasPurchased) {
      return res.status(403).json({ message: 'Bạn cần mua ebook này để xem PDF' });
    }

    res.json({ url: ebook.fileUrl });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = {
  getEbooks, getEbookById, createEbook, updateEbook, deleteEbook, addReview,
  getAllReviews, deleteReview, getMyEbookReviews, getPdfAccess,
};
