const express = require('express');
const router = express.Router();
const {
  getCategories, getAllCategories, createCategory, updateCategory, deleteCategory,
} = require('../controllers/categoryController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public
router.get('/', getCategories);

// Admin
router.get('/all', protect, adminOnly, getAllCategories);
router.post('/', protect, adminOnly, createCategory);
router.put('/:id', protect, adminOnly, updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

module.exports = router;
