const express = require('express');
const Chat = require('../models/Chat');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

// Get user chat
router.get('/user', auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({ userId: req.user._id });
    res.json(chat || { messages: [], problemType: null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User send message - ALWAYS WORKS via REST
router.post('/user', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: 'Message required' });

    const chat = await Chat.findOneAndUpdate(
      { userId: req.user._id },
      {
        $push: {
          messages: {
            sender: 'user',
            text: text.trim(),
            timestamp: new Date(),
            read: false
          }
        }
      },
      { upsert: true, new: true }
    );

    const lastMessage = chat.messages[chat.messages.length - 1];

    // Emit to socket if available
    const io = req.app.get('io');
    if (io) {
      io.to(req.user._id.toString()).emit('new_message', lastMessage);
      io.to(`user_${req.user._id}`).emit('new_message', lastMessage);
      io.to('admin_room').emit('new_chat', {
        userId: req.user._id,
        userName: req.user.fullName,
        message: text.trim(),
        timestamp: new Date()
      });
    }

    res.status(201).json(lastMessage);
  } catch (error) {
    console.error('[CHAT] Error saving message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all chats (admin)
router.get('/all', adminAuth, async (req, res) => {
  try {
    const chats = await Chat.find()
      .populate('userId', 'fullName email phoneNumber')
      .sort({ updatedAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific chat (admin)
router.get('/:userId', adminAuth, async (req, res) => {
  try {
    const chat = await Chat.findOne({ userId: req.params.userId })
      .populate('userId', 'fullName email phoneNumber');
    res.json(chat || { messages: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark messages as read
router.put('/read/:userId', adminAuth, async (req, res) => {
  try {
    const chat = await Chat.findOneAndUpdate(
      { userId: req.params.userId },
      { $set: { 'messages.$[elem].read': true } },
      { arrayFilters: [{ 'elem.sender': 'user', 'elem.read': false }], new: true }
    );
    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin reply
router.post('/reply/:userId', adminAuth, async (req, res) => {
  try {
    const { text } = req.body;
    const chat = await Chat.findOneAndUpdate(
      { userId: req.params.userId },
      {
        $push: {
          messages: {
            sender: 'admin',
            text,
            timestamp: new Date(),
            read: false
          }
        }
      },
      { upsert: true, new: true }
    );

    const io = req.app.get('io');
    const lastMessage = chat.messages[chat.messages.length - 1];
    if (io) {
      io.to(req.params.userId).emit('new_message', lastMessage);
      io.to(`user_${req.params.userId}`).emit('new_message', lastMessage);
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
