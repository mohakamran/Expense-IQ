const Transaction = require('../models/Transaction');

// @desc    Get all transactions (with filters)
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res, next) => {
  try {
    const { type, category, startDate, endDate, page = 1, limit = 20, sort = '-date' } = req.query;

    const query = { userId: req.user._id };

    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    }

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res, next) => {
  try {
    const { amount, type, category, date, notes, currency } = req.body;

    const transaction = await Transaction.create({
      userId: req.user._id,
      amount,
      type,
      category,
      date: date || new Date(),
      notes,
      currency: currency || req.user.currency || 'USD',
    });

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.to(req.user._id.toString()).emit('transaction_added', transaction);
    }

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    const { amount, type, category, date, notes } = req.body;
    if (amount !== undefined) transaction.amount = amount;
    if (type) transaction.type = type;
    if (category) transaction.category = category;
    if (date) transaction.date = date;
    if (notes !== undefined) transaction.notes = notes;

    await transaction.save();

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.to(req.user._id.toString()).emit('transaction_updated', transaction);
    }

    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.to(req.user._id.toString()).emit('transaction_deleted', { id: req.params.id });
    }

    res.status(200).json({ success: true, message: 'Transaction deleted', id: req.params.id });
  } catch (error) {
    next(error);
  }
};

// @desc    Get analytics summary
// @route   GET /api/transactions/analytics
// @access  Private
const getAnalytics = async (req, res, next) => {
  try {
    const { year = new Date().getFullYear(), month } = req.query;

    let startDate, endDate;
    if (month && month !== 'all') {
      startDate = new Date(year, parseInt(month) - 1, 1);
      endDate = new Date(year, parseInt(month), 0, 23, 59, 59, 999);
    } else {
      startDate = new Date(`${year}-01-01`);
      endDate = new Date(`${year}-12-31T23:59:59`);
    }

    const dateFilter = { $gte: startDate, $lte: endDate };

    // Monthly breakdown (if filtering by month, it just returns that month, which is fine)
    const monthly = await Transaction.aggregate([
      { $match: { userId: req.user._id, date: dateFilter } },
      {
        $group: {
          _id: { month: { $month: '$date' }, type: '$type' },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]);

    // Category breakdown
    const byCategory = await Transaction.aggregate([
      { $match: { userId: req.user._id, type: 'expense', date: dateFilter } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    // Totals for the period
    const totals = await Transaction.aggregate([
      { $match: { userId: req.user._id, date: dateFilter } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } },
    ]);

    const income = totals.find((t) => t._id === 'income')?.total || 0;
    const expenses = totals.find((t) => t._id === 'expense')?.total || 0;

    res.status(200).json({
      success: true,
      data: {
        totals: { income, expenses, balance: income - expenses },
        monthly,
        byCategory,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTransactions, createTransaction, updateTransaction, deleteTransaction, getAnalytics };
