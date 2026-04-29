const Category = require('../models/Category');

// GET /api/categories — Lấy tất cả danh mục (public)
const getCategories = async (req, res) => {
  try {
    const cats = await Category.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    res.json(cats);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/categories/all — Admin: lấy tất cả kể cả inactive
const getAllCategories = async (req, res) => {
  try {
    const cats = await Category.find().sort({ order: 1, createdAt: 1 });
    res.json(cats);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/categories — Admin: tạo danh mục
const createCategory = async (req, res) => {
  try {
    const { name, slug, description, icon, color, order } = req.body;
    if (!name || !slug) return res.status(400).json({ message: 'Tên và slug là bắt buộc' });

    const exists = await Category.findOne({ slug });
    if (exists) return res.status(400).json({ message: 'Slug đã tồn tại' });

    const cat = await Category.create({ name, slug, description, icon, color, order });
    res.status(201).json(cat);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PUT /api/categories/:id — Admin: cập nhật danh mục
const updateCategory = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Không tìm thấy danh mục' });

    const { name, slug, description, icon, color, order, isActive } = req.body;

    // Kiểm tra slug trùng (trừ chính nó)
    if (slug && slug !== cat.slug) {
      const dup = await Category.findOne({ slug });
      if (dup) return res.status(400).json({ message: 'Slug đã tồn tại' });
    }

    Object.assign(cat, { name, slug, description, icon, color, order, isActive });
    await cat.save();
    res.json(cat);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// DELETE /api/categories/:id — Admin: xóa danh mục
const deleteCategory = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    await cat.deleteOne();
    res.json({ message: 'Đã xóa danh mục' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getCategories, getAllCategories, createCategory, updateCategory, deleteCategory };
