const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// @desc    Get budget
// @route   GET /api/budget
// @access  Private
const getBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({ userId: req.user._id });

    // Calculate current month spending
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const spending = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          type: 'expense',
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
    ]);

    const totalSpent = spending.reduce((sum, s) => sum + s.total, 0);

    res.status(200).json({
      success: true,
      data: {
        budget: budget || null,
        totalSpent,
        spendingByCategory: spending,
        percentUsed: budget ? Math.round((totalSpent / budget.monthlyLimit) * 100) : 0,
        isOverBudget: budget ? totalSpent > budget.monthlyLimit : false,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Set/Update budget
// @route   POST /api/budget
// @access  Private
const setBudget = async (req, res, next) => {
  try {
    const { monthlyLimit, categoryLimits, alertThreshold } = req.body;

    const budget = await Budget.findOneAndUpdate(
      { userId: req.user._id },
      { monthlyLimit, categoryLimits, alertThreshold },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: budget });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBudget, setBudget };
