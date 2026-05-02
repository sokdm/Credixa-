const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');

// Mock data for now - replace with your actual Ticket model
let tickets = [
  {
    _id: '1',
    userId: 'user1',
    userName: 'John Doe',
    subject: 'Transfer Failed',
    message: 'My transfer to account 302093740966 failed',
    category: 'transfer',
    status: 'open',
    createdAt: new Date(),
    replies: []
  }
];

// Get all tickets (admin)
router.get('/tickets', adminAuth, async (req, res) => {
  try {
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Create ticket (user)
router.post('/tickets', auth, async (req, res) => {
  try {
    const { subject, message, category } = req.body;
    const ticket = {
      _id: Date.now().toString(),
      userId: req.user._id,
      userName: req.user.fullName,
      subject,
      message,
      category,
      status: 'open',
      createdAt: new Date(),
      replies: []
    };
    tickets.push(ticket);
    
    const io = req.app.get('io');
    io.to('admin_room').emit('new_ticket', ticket);
    
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// Reply to ticket
router.post('/tickets/:id/reply', auth, async (req, res) => {
  try {
    const { message, sender } = req.body;
    const ticket = tickets.find(t => t._id === req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    
    const reply = {
      sender: sender || 'user',
      message,
      timestamp: new Date()
    };
    ticket.replies.push(reply);
    
    const io = req.app.get('io');
    if (sender === 'admin') {
      io.to(`user_${ticket.userId}`).emit('notification', {
        title: 'Support Reply',
        message: `Admin replied to your ticket: ${ticket.subject}`,
        createdAt: new Date(),
        read: false
      });
    }
    
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to reply' });
  }
});

// Update ticket status
router.put('/tickets/:id', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = tickets.find(t => t._id === req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    
    ticket.status = status;
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

module.exports = router;
