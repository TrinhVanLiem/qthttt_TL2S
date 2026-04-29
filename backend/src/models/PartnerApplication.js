const mongoose = require('mongoose');

const partnerApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // Mỗi user chỉ có 1 đơn
    },
    // Thông tin cá nhân
    fullName:    { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    phone:       { type: String, required: true, trim: true },
    address:     { type: String, required: true, trim: true },
    idNumber:    { type: String, required: true, trim: true }, // CCCD/CMND
    bio:         { type: String, default: '' }, // Giới thiệu bản thân

    // Thông tin ngân hàng (chỉ lưu, không tự chuyển)
    bankName:    { type: String, required: true },
    bankAccount: { type: String, required: true },
    bankHolder:  { type: String, required: true },

    // Ebook mẫu
    sampleTitle:       { type: String, required: true },
    sampleDescription: { type: String, required: true },
    sampleFileUrl:     { type: String, required: true }, // URL PDF từ Cloudinary
    samplePublicId:    { type: String, default: '' },    // Cloudinary public_id

    // Trạng thái đơn
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectedReason: { type: String, default: '' },

    // Hoa hồng
    commissionRate: { type: Number, default: 70, min: 0, max: 100 },

    // Admin xử lý
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PartnerApplication', partnerApplicationSchema);
