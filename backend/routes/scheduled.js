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
    const name = String(req.body.name || '').trim();
    const amount = Number(req.body.amount);
    const nextDate = new Date(req.body.nextDate);
    const allowedFrequencies = ['daily', 'weekly', 'bi-weekly', 'monthly', 'yearly'];
    if (!name || !Number.isFinite(amount) || amount <= 0 || !Number.isFinite(nextDate.getTime())) {
      return res.status(400).json({ error: 'Name, positive amount, and valid next date are required' });
    }
    if (req.body.frequency && !allowedFrequencies.includes(req.body.frequency)) {
      return res.status(400).json({ error: 'Invalid payment frequency' });
    }
    const payment = new ScheduledPayment({
      name,
      amount,
      nextDate,
      frequency: req.body.frequency || 'monthly',
      status: 'active',
      category: String(req.body.category || 'other'),
      userId: req.user._id
    });
    await payment.save();
    res.status(201).json(payment);
  } catch (err) {
    console.error('Create scheduled payment error:', err);
    res.status(500).json({ error: 'Failed to create scheduled payment' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updates = {};
    if (req.body.name !== undefined) updates.name = String(req.body.name).trim();
    if (req.body.amount !== undefined) {
      const amount = Number(req.body.amount);
      if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ error: 'Payment amount must be positive' });
      updates.amount = amount;
    }
    if (req.body.nextDate !== undefined) {
      const nextDate = new Date(req.body.nextDate);
      if (!Number.isFinite(nextDate.getTime())) return res.status(400).json({ error: 'Invalid next payment date' });
      updates.nextDate = nextDate;
    }
    if (req.body.frequency !== undefined) {
      const allowedFrequencies = ['daily', 'weekly', 'bi-weekly', 'monthly', 'yearly'];
      if (!allowedFrequencies.includes(req.body.frequency)) return res.status(400).json({ error: 'Invalid payment frequency' });
      updates.frequency = req.body.frequency;
    }
    if (req.body.status !== undefined) {
      if (!['active', 'paused'].includes(req.body.status)) return res.status(400).json({ error: 'Invalid scheduled payment status' });
      updates.status = req.body.status;
    }
    if (req.body.category !== undefined) updates.category = String(req.body.category);
    const payment = await ScheduledPayment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!payment) return res.status(404).json({ error: 'Scheduled payment not found' });
    res.json(payment);
  } catch (err) {
    console.error('Update scheduled payment error:', err);
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
