const mongoose = require('mongoose');

const ebookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Vui lòng nhập tiêu đề'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Vui lòng nhập mô tả'],
    },
    price: {
      type: Number,
      required: [true, 'Vui lòng nhập giá'],
      min: 0,
    },
    thumbnail: {
      type: String,
      default: '',
    },
    images: {
      type: [{ url: String, publicId: String }],
      default: [],
    },
    fileUrl: {
      type: String,
      default: '', // Link tải file PDF (sau khi mua)
    },
    category: {
      type: String,
      required: [true, 'Vui lòng chọn danh mục'],
      enum: ['mien-bac', 'mien-trung', 'mien-nam', 'tay-nguyen', 'dao-bien', 'nuoc-ngoai'],
    },
    location: {
      type: String,
      required: [true, 'Vui lòng nhập địa điểm'],
      trim: true,
    },
    duration: {
      type: String, // VD: "3N2Đ", "5 ngày 4 đêm"
      default: '',
    },
    tags: {
      type: [String], // VD: ["tiết kiệm", "cặp đôi", "gia đình"]
      default: [],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    isApproved: {
      type: Boolean,
      default: true, // Admin tạo → auto approved; partner tạo → set false khi create
    },
    approvalStatus: {
      type: String,
      enum: ['approved', 'pending', 'rejected'],
      default: 'approved', // Admin tạo mặc định approved
    },
    rejectedReason: { type: String, default: '' },
    commissionRate: { type: Number, default: 0 }, // % doanh thu trả partner (0 = ebook admin)
    sales: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ebook', ebookSchema);
