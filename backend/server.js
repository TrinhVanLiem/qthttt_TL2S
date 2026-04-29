require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('./src/config/passport');
const connectDB = require('./src/config/db');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const ebookRoutes = require('./src/routes/ebookRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const userRoutes = require('./src/routes/userRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const partnerRoutes = require('./src/routes/partnerRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');

// Kết nối Database
connectDB();

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ebooks', ebookRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/partner', partnerRoutes);
app.use('/api/categories', categoryRoutes);

// Route kiểm tra server chạy
app.get('/', (req, res) => {
  res.json({ message: '🧭 TravelGuide Hub API đang chạy!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route không tồn tại' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
