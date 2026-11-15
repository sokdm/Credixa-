const express = require('express');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const SavingsGoal = require('../models/SavingsGoal');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get user profile (for auth context)
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lookup user by account number (for internal transfers)
router.get('/lookup/:accountNumber', auth, async (req, res) => {
  try {
    const user = await User.findOne({ accountNumber: req.params.accountNumber }, 'fullName accountNumber email');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user dashboard data
router.get('/dashboard', auth, async (req, res) => {
  try {
    const user = req.user;
    const transactionQuery = {
      $or: [{ senderId: user._id }, { receiverId: user._id }]
    };
    const [transactions, incomeResult, expensesResult, savingsResult, unreadCount] = await Promise.all([
      Transaction.find(transactionQuery).sort({ createdAt: -1 }).limit(10),
      Transaction.aggregate([
        { $match: { receiverId: user._id, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { senderId: user._id, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      SavingsGoal.aggregate([
        { $match: { userId: user._id } },
        { $group: { _id: null, total: { $sum: '$saved' } } }
      ]),
      Notification.countDocuments({ userId: user._id, read: false })
    ]);

    res.json({
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        accountNumber: user.accountNumber,
        balance: user.balance,
        currency: user.currency || '$',
        currencyCode: user.currencyCode || 'USD',
        country: user.country
      },
      transactions,
      unreadCount,
      stats: {
        income: incomeResult[0]?.total || 0,
        expenses: expensesResult[0]?.total || 0,
        savings: savingsResult[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get notifications
router.get('/notifications', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark notification as read
router.patch('/notifications/:id/read', auth, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all transactions
router.get('/transactions', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ senderId: req.user._id }, { receiverId: req.user._id }]
    }).sort({ createdAt: -1 });
    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Compatibility endpoints used by the dashboard shell.
router.get('/notifications/unread', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.user._id, read: false });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/notifications/read', auth, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { $set: { read: true } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
