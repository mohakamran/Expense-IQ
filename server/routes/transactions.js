const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getAnalytics,
} = require('../controllers/transactionController');
const { protect } = require('../middlewares/auth');

const validateTransaction = [
  body('amount').isNumeric().withMessage('Amount must be a number').isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
  body('notes').optional().isLength({ max: 500 }),
];

router.use(protect);

router.get('/analytics', getAnalytics);
router.get('/', getTransactions);
router.post('/', validateTransaction, createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
