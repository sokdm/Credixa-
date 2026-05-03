const express = require('express');
const router = express.Router();
const SavingsGoal = require('../models/SavingsGoal');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const goals = await SavingsGoal.find({ userId: req.user._id });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch savings goals' });
  }
});

router.post('/', async (req, res) => {
  try {
    const goal = new SavingsGoal({ ...req.body, userId: req.user._id });
    await goal.save();
    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create savings goal' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const goal = await SavingsGoal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update savings goal' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await SavingsGoal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Savings goal deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete savings goal' });
  }
});

module.exports = router;
