const express = require('express');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.post('/internal', auth, async (req, res) => {
  try {
    const { recipientAccount, amount, narration, pin } = req.body;
    console.log(`[TRANSFER] Internal transfer attempt by user: ${req.user._id}, amount: ${amount}`);

    const sender = await User.findById(req.user._id);
    if (!sender) {
      console.log(`[TRANSFER] Sender not found: ${req.user._id}`);
      return res.status(404).json({ error: 'Sender not found' });
    }

    console.log(`[TRANSFER] Sender found: ${sender.email}, balance: ${sender.balance}, PIN exists: ${!!sender.transactionPin}`);

    if (sender.isLocked) {
      console.log(`[TRANSFER] Account locked: ${sender._id}`);
      return res.status(403).json({ error: 'Account locked. Contact support.' });
    }

    if (!sender.transactionPin) {
      console.log(`[TRANSFER] No transaction PIN set for user: ${sender._id}`);
      return res.status(400).json({ error: 'Transaction PIN not set' });
    }

    console.log(`[TRANSFER] Stored PIN starts with '$2': ${sender.transactionPin.startsWith('$2')}`);
    const isPinValid = await bcrypt.compare(pin, sender.transactionPin);
    console.log(`[TRANSFER] PIN validation result: ${isPinValid}`);

    if (!isPinValid) {
      console.log(`[TRANSFER] Invalid PIN for user: ${sender._id}`);
      return res.status(400).json({ error: 'Invalid transaction PIN' });
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (sender.balance < transferAmount) {
      console.log(`[TRANSFER] Insufficient balance: ${sender.balance} < ${transferAmount}`);
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const receiver = await User.findOne({ accountNumber: recipientAccount });
    if (!receiver) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    if (sender.accountNumber === recipientAccount) {
      return res.status(400).json({ error: 'Cannot transfer to yourself' });
    }

    sender.balance -= transferAmount;
    receiver.balance += transferAmount;

    if (!sender.firstTransferDate) {
      sender.firstTransferDate = new Date();
    }

    await sender.save();
    await receiver.save();

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

    await transaction.save();

    await Notification.create({
      userId: sender._id,
      title: 'Transfer Successful',
      message: `You sent ${sender.currency}${transferAmount.toLocaleString()} to ${receiver.fullName}`
    });

    await Notification.create({
      userId: receiver._id,
      title: 'Money Received',
      message: `You received ${receiver.currency}${transferAmount.toLocaleString()} from ${sender.fullName}`
    });

    console.log(`[TRANSFER] Internal transfer successful: ${reference}`);
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
    console.error('[TRANSFER] Internal transfer error:', error);
    res.status(500).json({ error: error.message || 'Transfer failed' });
  }
});

router.post('/external', auth, async (req, res) => {
  try {
    const { bankName, accountNumber, accountName, amount, narration, pin } = req.body;
    console.log(`[TRANSFER] External transfer attempt by user: ${req.user._id}, amount: ${amount}`);

    const sender = await User.findById(req.user._id);
    if (!sender) {
      console.log(`[TRANSFER] Sender not found: ${req.user._id}`);
      return res.status(404).json({ error: 'Sender not found' });
    }

    console.log(`[TRANSFER] Sender found: ${sender.email}, PIN exists: ${!!sender.transactionPin}`);

    if (sender.isLocked) {
      return res.status(403).json({ error: 'Account locked. Contact support.' });
    }

    if (!sender.transactionPin) {
      return res.status(400).json({ error: 'Transaction PIN not set' });
    }

    console.log(`[TRANSFER] Stored PIN starts with '$2': ${sender.transactionPin.startsWith('$2')}`);
    const isPinValid = await bcrypt.compare(pin, sender.transactionPin);
    console.log(`[TRANSFER] PIN validation result: ${isPinValid}`);

    if (!isPinValid) {
      console.log(`[TRANSFER] Invalid PIN for user: ${sender._id}`);
      return res.status(400).json({ error: 'Invalid transaction PIN' });
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (sender.balance < transferAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    sender.balance -= transferAmount;
    if (!sender.firstTransferDate) {
      sender.firstTransferDate = new Date();
    }

    await sender.save();

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

    await transaction.save();

    await Notification.create({
      userId: sender._id,
      title: 'External Transfer Sent',
      message: `You sent ${sender.currency}${transferAmount.toLocaleString()} to ${accountName} at ${bankName}`
    });

    console.log(`[TRANSFER] External transfer successful: ${reference}`);
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
    console.error('[TRANSFER] External transfer error:', error);
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
