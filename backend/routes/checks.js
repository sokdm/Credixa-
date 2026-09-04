const express = require('express');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const InternalCheck = require('../models/InternalCheck');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

const makeCheckId = () => `CC-${uuidv4().replace(/-/g, '').slice(0, 16).toUpperCase()}`;

router.post('/', adminAuth, async (req, res) => {
  try {
    const { recipientEmail, amount, currency = 'USD', memo = '', expiresAt } = req.body;
    const numericAmount = Number(amount);
    if (!recipientEmail || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: 'Recipient email and a valid amount are required' });
    }
    const recipient = await User.findOne({ email: recipientEmail.toLowerCase().trim() }).select('_id fullName email currency');
    if (!recipient) return res.status(404).json({ error: 'Recipient account not found' });

    const check = await InternalCheck.create({
      checkId: makeCheckId(),
      createdBy: req.user._id,
      recipientId: recipient._id,
      recipientName: recipient.fullName,
      recipientEmail: recipient.email,
      amount: numericAmount,
      currency: String(currency).toUpperCase(),
      memo: String(memo).trim(),
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });
    res.status(201).json({ check });
  } catch (error) {
    console.error('[CHECK CREATE]', error);
    res.status(500).json({ error: 'Failed to create internal check' });
  }
});

router.get('/', adminAuth, async (req, res) => {
  try {
    const checks = await InternalCheck.find().sort({ createdAt: -1 }).limit(200);
    res.json({ checks });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch checks' });
  }
});

router.patch('/:checkId/cancel', adminAuth, async (req, res) => {
  const check = await InternalCheck.findOneAndUpdate(
    { checkId: req.params.checkId, status: { $in: ['created', 'pending'] } },
    { $set: { status: 'cancelled' } },
    { new: true }
  );
  if (!check) return res.status(404).json({ error: 'Check not found or no longer cancellable' });
  res.json({ check });
});

router.post('/verify', auth, async (req, res) => {
  const check = await InternalCheck.findOne({ checkId: String(req.body.checkId || '').trim() });
  if (!check) return res.status(404).json({ error: 'Credixa check not found' });
  if (check.expiresAt && check.expiresAt < new Date() && check.status === 'created') {
    await InternalCheck.updateOne({ _id: check._id, status: 'created' }, { $set: { status: 'expired' } });
    return res.status(400).json({ error: 'This check has expired' });
  }
  if (check.recipientId.toString() !== req.user._id.toString()) return res.status(403).json({ error: 'This check is not assigned to your account' });
  if (check.status !== 'created' && check.status !== 'pending') return res.status(400).json({ error: `Check is ${check.status}` });
  res.json({ valid: true, check: { checkId: check.checkId, recipientName: check.recipientName, amount: check.amount, currency: check.currency, memo: check.memo, expiresAt: check.expiresAt, status: check.status } });
});

router.post('/:checkId/deposit', auth, async (req, res) => {
  const session = await mongoose.startSession();
  try {
    let depositedCheck;
    await session.withTransaction(async () => {
      const check = await InternalCheck.findOneAndUpdate(
        { checkId: req.params.checkId, recipientId: req.user._id, status: { $in: ['created', 'pending'] }, $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] },
        { $set: { status: 'deposited', depositedAt: new Date(), depositedBy: req.user._id } },
        { new: true, session }
      );
      if (!check) throw new Error('CHECK_NOT_DEPOSITABLE');
      const user = await User.findByIdAndUpdate(req.user._id, { $inc: { balance: check.amount } }, { new: true, session });
      const transaction = new Transaction({
        senderId: check.createdBy,
        senderName: 'Credixa Internal Check',
        receiverId: user._id,
        receiverName: user.fullName,
        receiverAccountNumber: user.accountNumber,
        amount: check.amount,
        currency: check.currency,
        narration: check.memo || `Internal check ${check.checkId}`,
        type: 'admin',
        reference: check.checkId,
        status: 'completed'
      });
      await transaction.save({ session });
      depositedCheck = check;
    });
    res.json({ success: true, check: depositedCheck });
  } catch (error) {
    if (error.message === 'CHECK_NOT_DEPOSITABLE') return res.status(400).json({ error: 'Check is invalid, expired, cancelled, or already deposited' });
    console.error('[CHECK DEPOSIT]', error);
    res.status(500).json({ error: 'Unable to deposit check' });
  } finally {
    await session.endSession();
  }
});

module.exports = router;
