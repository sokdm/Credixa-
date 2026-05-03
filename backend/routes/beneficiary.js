const express = require('express');
const router = express.Router();
const Beneficiary = require('../models/Beneficiary');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const beneficiaries = await Beneficiary.find({ userId: req.user._id });
    res.json(beneficiaries);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch beneficiaries' });
  }
});

router.post('/', async (req, res) => {
  try {
    const beneficiary = new Beneficiary({ ...req.body, userId: req.user._id });
    await beneficiary.save();
    res.json(beneficiary);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create beneficiary' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    res.json(beneficiary);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update beneficiary' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Beneficiary.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Beneficiary deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete beneficiary' });
  }
});

module.exports = router;
