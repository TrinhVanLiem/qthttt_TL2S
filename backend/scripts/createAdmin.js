/**
 * Script tạo tài khoản Admin
 * Chạy: node backend/scripts/createAdmin.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Kết nối MongoDB thành công');

  // Kiểm tra model User
  let User;
  try {
    User = mongoose.model('User');
  } catch {
    const schema = new mongoose.Schema({
      name: String,
      email: { type: String, unique: true },
      password: String,
      role: { type: String, default: 'user' },
    }, { timestamps: true });
    User = mongoose.model('User', schema);
  }

  const email = 'trinhvanliem@gmail.com';
  const existing = await User.findOne({ email });

  if (existing) {
    // Nếu đã tồn tại, cập nhật role thành admin
    existing.role = 'admin';
    existing.password = await bcrypt.hash('Liem@123', 10);
    await existing.save();
    console.log('✅ Đã cập nhật tài khoản admin:', email);
  } else {
    await User.create({
      name: 'Trịnh Văn Liêm',
      email,
      password: await bcrypt.hash('Liem@123', 10),
      role: 'admin',
    });
    console.log('✅ Tạo tài khoản admin thành công:', email);
  }

  console.log('📧 Email   :', email);
  console.log('🔑 Password: Liem@123');
  console.log('👑 Role    : admin');
  await mongoose.disconnect();
  process.exit(0);
}

createAdmin().catch(err => { console.error('❌ Lỗi:', err); process.exit(1); });
