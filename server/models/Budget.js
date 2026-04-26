const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    monthlyLimit: {
      type: Number,
      required: [true, 'Monthly limit is required'],
      min: [0, 'Monthly limit must be non-negative'],
    },
    categoryLimits: [
      {
        category: { type: String, required: true },
        limit: { type: Number, required: true, min: 0 },
      },
    ],
    alertThreshold: {
      type: Number,
      default: 80, // alert at 80% of budget used
      min: 1,
      max: 100,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Budget', budgetSchema);
