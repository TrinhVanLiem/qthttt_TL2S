const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ebook: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ebook',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Mỗi user chỉ review 1 ebook 1 lần
reviewSchema.index({ user: 1, ebook: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
