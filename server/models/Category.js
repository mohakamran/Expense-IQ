const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null = default/system category
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [30, 'Category name cannot exceed 30 characters'],
    },
    type: {
      type: String,
      enum: ['income', 'expense', 'both'],
      required: true,
    },
    icon: {
      type: String,
      default: '📦',
    },
    color: {
      type: String,
      default: '#6366f1',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
