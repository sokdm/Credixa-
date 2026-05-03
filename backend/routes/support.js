const express = require('express');
const router = express.Router();
const SupportMessage = require('../models/SupportMessage');
const { auth, adminAuth } = require('../middleware/auth');

// Get user's support chat
router.get('/chat', auth, async (req, res) => {
  try {
    const chat = await SupportMessage.findOne({ userId: req.user.id }).sort({ updatedAt: -1 });
    if (!chat) return res.json({ messages: [], problemType: null, status: 'active' });
    res.json({
      messages: chat.messages,
      problemType: chat.category,
      status: chat.status === 'open' ? 'active' : 'closed'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start or get chat
router.post('/chat/start', auth, async (req, res) => {
  try {
    const { problemType } = req.body;
    let chat = await SupportMessage.findOne({ userId: req.user.id, status: 'open' });
    
    if (!chat) {
      chat = new SupportMessage({
        userId: req.user.id,
        userName: req.user.fullName,
        category: problemType || 'other',
        subject: PROBLEM_LABELS[problemType] || 'Support Request',
        messages: [{
          sender: 'admin',
          text: `Thanks for reaching out about ${PROBLEM_LABELS[problemType] || 'your issue'}. An agent will assist you shortly. How can we help?`,
          read: true
        }]
      });
      await chat.save();
    }
    
    res.json({
      messages: chat.messages,
      problemType: chat.category,
      status: 'active'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send message
router.post('/chat/user', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: 'Message required' });

    let chat = await SupportMessage.findOne({ userId: req.user.id, status: 'open' });
    if (!chat) {
      chat = new SupportMessage({
        userId: req.user.id,
        userName: req.user.fullName,
        category: 'other',
        subject: 'Support Request',
        messages: []
      });
    }

    chat.messages.push({
      sender: 'user',
      text: text.trim(),
      timestamp: new Date(),
      read: false
    });
    chat.updatedAt = new Date();
    await chat.save();

    res.status(201).json({
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString(),
      read: false
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: get all open chats
router.get('/tickets', adminAuth, async (req, res) => {
  try {
    const chats = await SupportMessage.find({ status: 'open' }).sort({ updatedAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: reply to chat
router.post('/tickets/:id/reply', adminAuth, async (req, res) => {
  try {
    const { message } = req.body;
    const chat = await SupportMessage.findById(req.params.id);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    chat.messages.push({
      sender: 'admin',
      text: message,
      timestamp: new Date(),
      read: false
    });
    chat.updatedAt = new Date();
    await chat.save();

    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: close ticket
router.put('/tickets/:id', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const chat = await SupportMessage.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    );
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PROBLEM_LABELS = {
  transaction: 'Transaction Issue',
  card: 'Card Problem',
  account: 'Account Access',
  security: 'Security Concern',
  loan: 'Loan & Credit',
  other: 'Something Else'
};

module.exports = router;
