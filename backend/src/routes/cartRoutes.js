const express = require('express');
const router = express.Router();
const { getCart, addToCart, removeFromCart, syncCart, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // tất cả routes đều cần đăng nhập

router.get('/', getCart);
router.post('/add', addToCart);
router.post('/sync', syncCart);
router.delete('/remove/:ebookId', removeFromCart);
router.delete('/clear', clearCart);

module.exports = router;
