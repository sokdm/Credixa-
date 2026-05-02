const express = require('express');
const CardRequest = require('../models/CardRequest');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

// Request card
router.post('/request', auth, async (req, res) => {
  try {
    const { cardType, address, phone } = req.body;
    const card = new CardRequest({
      userId: req.user._id,
      userName: req.user.fullName,
      cardType,
      address,
      phone
    });
    
    await card.save();
    res.json({ message: 'Card request submitted successfully', card });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user cards
router.get('/my-cards', auth, async (req, res) => {
  try {
    const cards = await CardRequest.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all card requests (admin)
router.get('/all', adminAuth, async (req, res) => {
  try {
    const cards = await CardRequest.find()
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 });
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update card status (admin)
router.put('/:cardId', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const card = await CardRequest.findByIdAndUpdate(
      req.params.cardId,
      { status },
      { new: true }
    );
    res.json(card);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
