const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: '' },
    icon: { type: String, default: '📁' }, // emoji icon
    color: { type: String, default: '#1B6B4A' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }, // thứ tự hiển thị
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
