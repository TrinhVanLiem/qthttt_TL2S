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
} = require('../controllers/ebookController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getEbooks);
router.get('/:id', getEbookById);

// Private routes
router.post('/:id/reviews', protect, addReview);
router.get('/partner/my-reviews', protect, getMyEbookReviews); // Partner xem reviews ebook của mình

// Admin routes
router.get('/admin/reviews', protect, adminOnly, getAllReviews);
router.delete('/admin/reviews/:id', protect, adminOnly, deleteReview);
router.post('/', protect, adminOnly, createEbook);
router.put('/:id', protect, adminOnly, updateEbook);
router.delete('/:id', protect, adminOnly, deleteEbook);

module.exports = router;
