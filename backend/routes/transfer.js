const express = require('express');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.post('/internal', auth, async (req, res) => {
  const session = await User.startSession();
  session.startTransaction();

  try {
    const { recipientAccount, amount, narration, pin } = req.body;

    const sender = await User.findById(req.user._id).session(session);
    if (!sender) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: 'Sender not found' });
    }

    if (sender.isLocked) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ error: 'Account locked. Contact support.' });
    }

    if (!sender.transactionPin) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: 'Transaction PIN not set' });
    }

    const isPinValid = await bcrypt.compare(pin, sender.transactionPin);
    if (!isPinValid) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: 'Invalid transaction PIN' });
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (sender.balance < transferAmount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const receiver = await User.findOne({ accountNumber: recipientAccount }).session(session);
    if (!receiver) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: 'Recipient not found' });
    }

    if (sender.accountNumber === recipientAccount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: 'Cannot transfer to yourself' });
    }

    sender.balance -= transferAmount;
    receiver.balance += transferAmount;

    if (!sender.firstTransferDate) {
      sender.firstTransferDate = new Date();
    }

    await sender.save({ session });
    await receiver.save({ session });

    const reference = 'CRX' + uuidv4().substring(0, 12).toUpperCase();

    const transaction = new Transaction({
      senderId: sender._id,
      senderName: sender.fullName,
      receiverId: receiver._id,
      receiverName: receiver.fullName,
      receiverAccountNumber: receiver.accountNumber,
      amount: transferAmount,
      currency: sender.currency,
      narration,
      type: 'internal',
      reference,
      status: 'completed'
    });

    await transaction.save({ session });

    await Notification.create([{
      userId: sender._id,
      title: 'Transfer Successful',
      message: `You sent ${sender.currency}${transferAmount.toLocaleString()} to ${receiver.fullName}`
    }, {
      userId: receiver._id,
      title: 'Money Received',
      message: `You received ${receiver.currency}${transferAmount.toLocaleString()} from ${sender.fullName}`
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      transaction: {
        reference,
        senderName: sender.fullName,
        senderAccountNumber: sender.accountNumber,
        receiverName: receiver.fullName,
        receiverAccountNumber: receiver.accountNumber,
        bankName: 'Credixa Banking',
        amount: transferAmount,
        currency: sender.currency,
        narration: narration || 'Internal Transfer',
        date: new Date().toISOString(),
        status: 'success'
      }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Internal transfer error:', error);
    res.status(500).json({ error: error.message || 'Transfer failed' });
  }
});

router.post('/external', auth, async (req, res) => {
  const session = await User.startSession();
  session.startTransaction();

  try {
    const { bankName, accountNumber, accountName, amount, narration, pin } = req.body;

    const sender = await User.findById(req.user._id).session(session);
    if (!sender) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: 'Sender not found' });
    }

    if (sender.isLocked) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ error: 'Account locked. Contact support.' });
    }

    if (!sender.transactionPin) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: 'Transaction PIN not set' });
    }

    const isPinValid = await bcrypt.compare(pin, sender.transactionPin);
    if (!isPinValid) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: 'Invalid transaction PIN' });
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (sender.balance < transferAmount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    sender.balance -= transferAmount;
    if (!sender.firstTransferDate) {
      sender.firstTransferDate = new Date();
    }

    await sender.save({ session });

    const reference = 'CRX' + uuidv4().substring(0, 12).toUpperCase();

    const transaction = new Transaction({
      senderId: sender._id,
      senderName: sender.fullName,
      receiverName: accountName,
      receiverAccountNumber: accountNumber,
      receiverBankName: bankName,
      amount: transferAmount,
      currency: sender.currency,
      narration,
      type: 'external',
      reference,
      status: 'completed'
    });

    await transaction.save({ session });

    await Notification.create([{
      userId: sender._id,
      title: 'External Transfer Sent',
      message: `You sent ${sender.currency}${transferAmount.toLocaleString()} to ${accountName} at ${bankName}`
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      transaction: {
        reference,
        senderName: sender.fullName,
        senderAccountNumber: sender.accountNumber,
        receiverName: accountName,
        receiverAccountNumber: accountNumber,
        bankName: bankName,
        amount: transferAmount,
        currency: sender.currency,
        narration: narration || 'External Transfer',
        date: new Date().toISOString(),
        status: 'success'
      }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('External transfer error:', error);
    res.status(500).json({ error: error.message || 'External transfer failed' });
  }
});

router.get('/history', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ senderId: req.user._id }, { receiverId: req.user._id }]
    }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
