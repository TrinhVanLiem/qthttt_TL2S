const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const passport = require('../config/passport');

// JWT routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// ===== GOOGLE OAUTH =====
// Step 1: Redirect sang Google
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// Step 2: Google callback → redirect về frontend kèm token
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_failed` }),
  (req, res) => {
    const { user, token } = req.user;
    // Redirect về frontend với token trong URL (frontend sẽ lưu vào localStorage)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/oauth-callback?token=${token}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}&role=${user.role}&id=${user._id}`);
  }
);

module.exports = router;
