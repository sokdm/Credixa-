const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user._id });
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const spending = await Transaction.aggregate([
      {
        $match: {
          senderId: req.user._id,
          status: 'completed',
          createdAt: { $gte: monthStart }
        }
      },
      {
        $group: {
          _id: { $ifNull: ['$category', 'other'] },
          spent: { $sum: '$amount' }
        }
      }
    ]);
    const spentByCategory = new Map(spending.map((item) => [item._id, item.spent]));
    budgets.forEach((budget) => {
      budget.spent = spentByCategory.get(budget.category.toLowerCase()) || 0;
    });
    res.json(budgets);
  } catch (err) {
    console.error('Fetch budgets error:', err);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

router.post('/', async (req, res) => {
  try {
    const category = String(req.body.category || '').trim().toLowerCase();
    const limit = Number(req.body.limit);
    if (!category || !Number.isFinite(limit) || limit <= 0) {
      return res.status(400).json({ error: 'Category and a positive budget limit are required' });
    }
    const budget = new Budget({ category, limit, color: req.body.color, userId: req.user._id });
    await budget.save();
    budget.spent = 0;
    res.status(201).json(budget);
  } catch (err) {
    console.error('Create budget error:', err);
    res.status(500).json({ error: 'Failed to create budget' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updates = {};
    if (req.body.category !== undefined) updates.category = String(req.body.category).trim().toLowerCase();
    if (req.body.limit !== undefined) {
      const limit = Number(req.body.limit);
      if (!Number.isFinite(limit) || limit <= 0) return res.status(400).json({ error: 'Budget limit must be positive' });
      updates.limit = limit;
    }
    if (req.body.color !== undefined) updates.color = String(req.body.color);
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!budget) return res.status(404).json({ error: 'Budget not found' });
    res.json(budget);
  } catch (err) {
    console.error('Update budget error:', err);
    res.status(500).json({ error: 'Failed to update budget' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Budget deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete budget' });
  }
});

module.exports = router;
