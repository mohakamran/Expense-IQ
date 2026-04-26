const Category = require('../models/Category');

// Default system categories seeded on first request
const DEFAULT_CATEGORIES = [
  { name: 'Salary', type: 'income', icon: '💼', color: '#10b981', isDefault: true },
  { name: 'Freelance', type: 'income', icon: '💻', color: '#3b82f6', isDefault: true },
  { name: 'Investment', type: 'income', icon: '📈', color: '#8b5cf6', isDefault: true },
  { name: 'Other Income', type: 'income', icon: '💰', color: '#f59e0b', isDefault: true },
  { name: 'Food & Dining', type: 'expense', icon: '🍔', color: '#ef4444', isDefault: true },
  { name: 'Transportation', type: 'expense', icon: '🚗', color: '#f97316', isDefault: true },
  { name: 'Shopping', type: 'expense', icon: '🛍️', color: '#ec4899', isDefault: true },
  { name: 'Entertainment', type: 'expense', icon: '🎮', color: '#a855f7', isDefault: true },
  { name: 'Health', type: 'expense', icon: '🏥', color: '#14b8a6', isDefault: true },
  { name: 'Education', type: 'expense', icon: '📚', color: '#06b6d4', isDefault: true },
  { name: 'Utilities', type: 'expense', icon: '⚡', color: '#eab308', isDefault: true },
  { name: 'Housing', type: 'expense', icon: '🏠', color: '#84cc16', isDefault: true },
  { name: 'Travel', type: 'expense', icon: '✈️', color: '#f43f5e', isDefault: true },
  { name: 'Other', type: 'both', icon: '📦', color: '#6b7280', isDefault: true },
];

// @desc    Get all categories (default + user's)
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({
      $or: [{ userId: null }, { userId: req.user._id }],
    }).sort({ isDefault: -1, name: 1 });

    // Seed defaults if none exist
    if (categories.filter((c) => c.isDefault).length === 0) {
      const defaults = await Category.insertMany(DEFAULT_CATEGORIES);
      return res.status(200).json({ success: true, data: [...defaults, ...categories.filter((c) => !c.isDefault)] });
    }

    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Create custom category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res, next) => {
  try {
    const { name, type, icon, color } = req.body;

    const existing = await Category.findOne({ name, userId: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category with this name already exists' });
    }

    const category = await Category.create({
      userId: req.user._id,
      name,
      type,
      icon: icon || '📦',
      color: color || '#6366f1',
      isDefault: false,
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete custom category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, userId: req.user._id, isDefault: false });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found or cannot delete default' });
    }

    await category.deleteOne();
    res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update custom category
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, userId: req.user._id, isDefault: false });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found or cannot update default' });
    }

    const { name, icon, color } = req.body;
    if (name) category.name = name;
    if (icon) category.icon = icon;
    if (color) category.color = color;

    await category.save();
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// Seed defaults on startup
const seedDefaults = async () => {
  const count = await Category.countDocuments({ isDefault: true });
  if (count === 0) {
    await Category.insertMany(DEFAULT_CATEGORIES);
    console.log('✅ Default categories seeded');
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory, seedDefaults };
