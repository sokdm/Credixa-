const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { adminAuth } = require('../middleware/auth');

router.use(adminAuth);

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'fullName email balance isActive accountNumber currency phoneNumber isLocked');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const users = await User.find();
    const totalBalance = users.reduce((sum, u) => sum + (u.balance || 0), 0);
    const totalTransfers = await Transaction.countDocuments({ type: 'admin' });
    const totalVolume = await Transaction.aggregate([
      { $match: { type: 'admin' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const activeUsers = users.filter(u => !u.isLocked).length;
    const lockedUsers = users.filter(u => u.isLocked).length;
    res.json({
      totalUsers: users.length,
      totalTransfers,
      totalVolume: totalVolume[0]?.total || 0,
      activeUsers,
      lockedUsers
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.put('/users/:id/lock', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.isLocked = !user.isLocked;
    await user.save();
    res.json({ message: `User ${user.isLocked ? 'locked' : 'unlocked'}`, user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.post('/transfer', async (req, res) => {
  try {
    const { userId, amount, senderName, description } = req.body;
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'User and valid amount required' });
    }
    const receiver = await User.findById(userId);
    if (!receiver) return res.status(404).json({ error: 'User not found' });
    if (receiver.isLocked) return res.status(400).json({ error: 'User account is locked' });

    const reference = 'ADM' + uuidv4().substring(0, 12).toUpperCase();

    const transaction = new Transaction({
      sender: 'admin',
      senderId: req.user?._id || null,
      senderName: senderName || 'Credixa Admin',
      receiver: receiver.email,
      receiverId: receiver._id,
      receiverName: receiver.fullName,
      receiverAccountNumber: receiver.accountNumber,
      amount: Number(amount),
      type: 'admin',
      status: 'completed',
      description: description || 'Admin transfer',
      reference: reference,
      currency: receiver.currency || '$'
    });

    receiver.balance = (receiver.balance || 0) + Number(amount);
    await receiver.save();
    await transaction.save();

    res.json({ success: true, message: 'Transfer completed' });
  } catch (err) {
    console.error('Admin transfer error:', err);
    res.status(500).json({ error: err.message || 'Transfer failed' });
  }
});

module.exports = router;
