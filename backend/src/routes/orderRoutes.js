const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getAllOrders, getOrderStats } = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/stats', protect, adminOnly, getOrderStats);
router.get('/', protect, adminOnly, getAllOrders);

module.exports = router;
