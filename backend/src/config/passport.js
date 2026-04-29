const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    if (!email) return done(new Error('Không lấy được email từ Google'), null);

    // Tìm hoặc tạo user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: profile.displayName,
        email,
        password: Math.random().toString(36) + '@Google',  // random pw, không dùng
        googleId: profile.id,
        avatar: profile.photos?.[0]?.value || '',
      });
    } else if (!user.googleId) {
      user.googleId = profile.id;
      if (!user.avatar && profile.photos?.[0]?.value) user.avatar = profile.photos[0].value;
      await user.save();
    }

    return done(null, { user, token: generateToken(user._id) });
  } catch (err) {
    return done(err, null);
  }
}));

// Không cần serialize/deserialize vì dùng JWT (stateless)
passport.serializeUser((data, done) => done(null, data));
passport.deserializeUser((data, done) => done(null, data));

module.exports = passport;
