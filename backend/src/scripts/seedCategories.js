/**
 * Script seed 6 danh mục mặc định vào MongoDB
 * Chạy: node src/scripts/seedCategories.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');

const DEFAULT_CATEGORIES = [
  { name: 'Miền Bắc',   slug: 'mien-bac',   icon: 'FaMountain', color: '#1B6B4A', description: 'Hà Nội, Hà Giang, Sa Pa, Ninh Bình...', order: 1 },
  { name: 'Miền Trung', slug: 'mien-trung', icon: 'FaMapMarkedAlt', color: '#2563eb', description: 'Đà Nẵng, Hội An, Huế, Quảng Bình...', order: 2 },
  { name: 'Miền Nam',   slug: 'mien-nam',   icon: 'FaMap', color: '#e8a020', description: 'TP.HCM, Đà Lạt, Mũi Né, Phú Quốc...', order: 3 },
  { name: 'Tây Nguyên', slug: 'tay-nguyen', icon: 'FaTree', color: '#16a34a', description: 'Buôn Ma Thuột, Đắk Nông, Kon Tum...', order: 4 },
  { name: 'Đảo & Biển', slug: 'dao-bien',   icon: 'FaUmbrellaBeach', color: '#0891b2', description: 'Phú Quốc, Côn Đảo, Cát Bà, Lý Sơn...', order: 5 },
  { name: 'Nước ngoài', slug: 'nuoc-ngoai', icon: 'FaPlane', color: '#7c3aed', description: 'Thái Lan, Nhật Bản, Hàn Quốc, Singapore...', order: 6 },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    let added = 0, skipped = 0;

    for (const cat of DEFAULT_CATEGORIES) {
      const exists = await Category.findOne({ slug: cat.slug });
      if (exists) {
        // Cập nhật thông tin nếu đã tồn tại
        await Category.updateOne({ slug: cat.slug }, { $set: cat });
        console.log(`  Updated: ${cat.name}`);
        skipped++;
      } else {
        await Category.create({ ...cat, isActive: true });
        console.log(`  Created: ${cat.name}`);
        added++;
      }
    }

    console.log(`\nDone! Added: ${added}, Updated: ${skipped}`);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
