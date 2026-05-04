const express = require('express');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');
const router = express.Router();

// NEW: Lookup user by account number before transfer
router.get('/lookup-account/:accountNumber', auth, async (req, res) => {
  try {
    const cleanAccount = req.params.accountNumber.trim().replace(/\s/g, '');
    const user = await User.findOne({ accountNumber: cleanAccount }).select('fullName accountNumber');
    
    if (!user) {
      return res.status(404).json({ error: 'No user found with this account number' });
    }
    
    res.json({
      found: true,
      fullName: user.fullName,
      accountNumber: user.accountNumber
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/internal', auth, async (req, res) => {
  try {
    const { recipientAccount, amount, narration, pin } = req.body;
    console.log(`[TRANSFER] Internal transfer attempt by user: ${req.user._id}, recipient: ${recipientAccount}, amount: ${amount}`);

    const sender = await User.findById(req.user._id);
    if (!sender) {
      return res.status(404).json({ error: 'Sender not found' });
    }

    if (sender.isLocked) {
      return res.status(403).json({ error: 'Account locked. Contact support.' });
    }

    if (!sender.transactionPin) {
      return res.status(400).json({ error: 'Transaction PIN not set' });
    }

    const isHashed = sender.transactionPin.startsWith('$2');
    let isPinValid;
    if (isHashed) {
      isPinValid = await bcrypt.compare(pin, sender.transactionPin);
    } else {
      isPinValid = pin === sender.transactionPin;
    }

    if (!isPinValid) {
      return res.status(400).json({ error: 'Invalid transaction PIN' });
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (sender.balance < transferAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // FIXED: Clean and search account number
    const cleanAccount = recipientAccount.toString().trim().replace(/\s/g, '');
    console.log(`[TRANSFER] Searching for account: "${cleanAccount}"`);

    let receiver = await User.findOne({ accountNumber: cleanAccount });
    
    if (!receiver) {
      console.log(`[TRANSFER] Recipient not found for account: "${cleanAccount}"`);
      return res.status(404).json({ error: 'No user found with this account number' });
    }

    console.log(`[TRANSFER] Found receiver: ${receiver.fullName}, account: ${receiver.accountNumber}`);

    if (sender._id.toString() === receiver._id.toString()) {
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
    
    const sender = await User.findById(req.user._id);
    if (!sender) {
      return res.status(404).json({ error: 'Sender not found' });
    }

    if (sender.isLocked) {
      return res.status(403).json({ error: 'Account locked. Contact support.' });
    }

    if (!sender.transactionPin) {
      return res.status(400).json({ error: 'Transaction PIN not set' });
    }

    const isHashed = sender.transactionPin.startsWith('$2');
    let isPinValid;
    if (isHashed) {
      isPinValid = await bcrypt.compare(pin, sender.transactionPin);
    } else {
      isPinValid = pin === sender.transactionPin;
    }

    if (!isPinValid) {
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
