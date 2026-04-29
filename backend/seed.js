require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/travelguide';

const ebookSchema = new mongoose.Schema({
  title: String, description: String, price: Number,
  category: String, location: String, duration: String,
  tags: [String], badge: String, rating: Number,
  numReviews: Number, sales: Number,
}, { timestamps: true });

const Ebook = mongoose.model('Ebook', ebookSchema);

const EBOOKS = [
  {
    title: 'Guide Đà Lạt 3N2Đ Tự túc chi tiết',
    description: 'Hướng dẫn du lịch Đà Lạt 3 ngày 2 đêm đầy đủ từ A-Z. Lịch trình chi tiết, ngân sách tiết kiệm, địa điểm check-in đẹp.',
    price: 79000, category: 'tay-nguyen', location: 'Đà Lạt', duration: '3N2Đ',
    tags: ['tiết kiệm', 'tự túc', 'núi'], badge: 'hot', rating: 4.8, numReviews: 128, sales: 356
  },
  {
    title: 'Guide Phú Quốc 4N3Đ Tự túc chi tiết',
    description: 'Khám phá đảo ngọc Phú Quốc trong 4 ngày 3 đêm. Biển đẹp, hải sản tươi ngon, chi phí hợp lý.',
    price: 89000, category: 'mien-nam', location: 'Phú Quốc', duration: '4N3Đ',
    tags: ['biển', 'đảo', 'nghỉ dưỡng'], badge: 'new', rating: 4.9, numReviews: 95, sales: 210
  },
  {
    title: 'Guide Hội An 2N1Đ Tự túc chi tiết',
    description: 'Trải nghiệm phố cổ Hội An lãng mạn trong 2 ngày 1 đêm. Ẩm thực phong phú, kiến trúc độc đáo.',
    price: 59000, category: 'mien-trung', location: 'Hội An', duration: '2N1Đ',
    tags: ['phố cổ', 'lịch sử', 'ẩm thực'], badge: '', rating: 4.7, numReviews: 82, sales: 178
  },
  {
    title: 'Guide Hà Giang 4N3Đ Tự túc chi tiết',
    description: 'Chinh phục cao nguyên đá Hà Giang hùng vĩ. Mùa hoa tam giác mạch, đèo Mã Pì Lèng ngoạn mục.',
    price: 59000, category: 'mien-bac', location: 'Hà Giang', duration: '4N3Đ',
    tags: ['núi', 'phượt', 'thiên nhiên'], badge: 'best', rating: 4.9, numReviews: 156, sales: 289
  },
  {
    title: 'Guide Đà Nẵng 5N4Đ Tự túc chi tiết',
    description: 'Khám phá thành phố đáng sống Đà Nẵng trong 5 ngày 4 đêm. Biển Mỹ Khê, Bà Nà Hills, phố cổ Hội An gần kề.',
    price: 79000, category: 'mien-trung', location: 'Đà Nẵng', duration: '5N4Đ',
    tags: ['biển', 'thành phố', 'gia đình'], badge: 'hot', rating: 4.8, numReviews: 203, sales: 445
  },
  {
    title: 'Guide Bangkok 4N3Đ Tự túc chi tiết',
    description: 'Khám phá thủ đô Thái Lan sôi động. Chợ nổi, chùa vàng, ẩm thực đường phố hấp dẫn.',
    price: 99000, category: 'nuoc-ngoai', location: 'Bangkok', duration: '4N3Đ',
    tags: ['quốc tế', 'Thái Lan', 'đường phố'], badge: 'new', rating: 4.7, numReviews: 67, sales: 134
  },
  {
    title: 'Guide Nha Trang 3N2Đ Tự túc chi tiết',
    description: 'Thiên đường biển Nha Trang với bãi cát trắng, làn nước trong xanh và hải sản tươi ngon.',
    price: 69000, category: 'mien-trung', location: 'Nha Trang', duration: '3N2Đ',
    tags: ['biển', 'lặn biển', 'nghỉ dưỡng'], badge: '', rating: 4.6, numReviews: 74, sales: 167
  },
  {
    title: 'Guide Sapa 3N2Đ Tự túc chi tiết',
    description: 'Trekking qua những thửa ruộng bậc thang đẹp mê hồn của Sapa. Văn hóa dân tộc thiểu số độc đáo.',
    price: 69000, category: 'mien-bac', location: 'Sapa', duration: '3N2Đ',
    tags: ['núi', 'trekking', 'dân tộc'], badge: '', rating: 4.8, numReviews: 91, sales: 198
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Kết nối MongoDB thành công!');

    await Ebook.deleteMany({});
    console.log('🗑  Đã xóa dữ liệu cũ');

    const inserted = await Ebook.insertMany(EBOOKS);
    console.log(`✅ Đã thêm ${inserted.length} guide vào database:`);
    inserted.forEach(e => console.log(`   - ${e.title} (${e.price.toLocaleString('vi-VN')}đ)`));

    console.log('\n🎉 Seed hoàn tất! Mở http://localhost:3001 để xem.');
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
