const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        ebook: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Ebook',
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        title: String,
        thumbnail: String,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      default: 'mock', // mock payment cho bài tập
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'paid', // Mock nên mặc định là paid
    },
    status: {
      type: String,
      enum: ['processing', 'completed', 'cancelled'],
      default: 'completed',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
