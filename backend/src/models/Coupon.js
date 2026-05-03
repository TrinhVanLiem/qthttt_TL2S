const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['percent', 'fixed'],
      default: 'percent',
    },
    minOrder: {
      type: Number,
      default: 0,
    },
    expiry: {
      type: Date,
      default: null,
    },
    active: {
      type: Boolean,
      default: true,
    },
    usageLimit: {
      type: Number,
      default: null, // null = không giới hạn
    },
    usedCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coupon', couponSchema);
