const express = require('express');
const router = express.Router();
const {
  getEbooks,
  getEbookById,
  createEbook,
  updateEbook,
  deleteEbook,
  addReview,
  getAllReviews,
  deleteReview,
  getMyEbookReviews,
  getPdfAccess,
} = require('../controllers/ebookController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getEbooks);

// Private routes — phải đặt TRƯỚC /:id để tránh conflict
router.get('/partner/my-reviews', protect, getMyEbookReviews);
router.get('/admin/reviews', protect, adminOnly, getAllReviews);

router.get('/:id', getEbookById);
router.post('/:id/reviews', protect, addReview);
router.get('/:id/pdf', protect, getPdfAccess); // 🔒 Chỉ seller/admin/người đã mua

// Admin routes
router.delete('/admin/reviews/:id', protect, adminOnly, deleteReview);
router.post('/', protect, adminOnly, createEbook);
router.put('/:id', protect, adminOnly, updateEbook);
router.delete('/:id', protect, adminOnly, deleteEbook);

module.exports = router;
