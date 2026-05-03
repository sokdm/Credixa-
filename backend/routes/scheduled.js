const express = require('express');
const router = express.Router();
const ScheduledPayment = require('../models/ScheduledPayment');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const payments = await ScheduledPayment.find({ userId: req.user._id });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch scheduled payments' });
  }
});

router.post('/', async (req, res) => {
  try {
    const payment = new ScheduledPayment({ ...req.body, userId: req.user._id });
    await payment.save();
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create scheduled payment' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const payment = await ScheduledPayment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update scheduled payment' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await ScheduledPayment.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Scheduled payment deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete scheduled payment' });
  }
});

module.exports = router;
