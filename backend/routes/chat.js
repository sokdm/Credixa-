const express = require('express');
const Chat = require('../models/Chat');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

// Get user chat
router.get('/user', auth, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const chat = await Chat.findOne({ userId });
    res.json(chat || { messages: [], problemType: null });
  } catch (error) {
    console.error('[CHAT GET ERROR]', error);
    res.status(500).json({ error: error.message });
  }
});

// User send message
router.post('/user', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: 'Message required' });

    const userId = req.user._id || req.user.id;
    const userName = req.user.fullName || req.user.name || 'User';

    const chat = await Chat.findOneAndUpdate(
      { userId },
      {
        $push: {
          messages: {
            sender: 'user',
            text: text.trim(),
            timestamp: new Date(),
            read: false
          }
        },
        $setOnInsert: { userId }
      },
      { upsert: true, new: true }
    );

    const lastMessage = chat.messages[chat.messages.length - 1];

    // Emit to socket if available
    const io = req.app.get('io');
    if (io) {
      io.to(userId.toString()).emit('new_message', lastMessage);
      io.to(`user_${userId}`).emit('new_message', lastMessage);
      // REMOVED: io.to('admin_room').emit('new_chat', ...) — server.js socket handler already does this
    }

    res.status(201).json(lastMessage);
  } catch (error) {
    console.error('[CHAT POST ERROR]', error);
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
