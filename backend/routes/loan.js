const express = require('express');
const LoanRequest = require('../models/LoanRequest');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

// Check eligibility
router.get('/eligibility', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const isEligible = user.firstTransferDate && 
      (new Date() - user.firstTransferDate) >= (30 * 24 * 60 * 60 * 1000);
    
    res.json({ 
      eligible: isEligible,
      firstTransferDate: user.firstTransferDate,
      message: isEligible ? 'You are eligible for loans' : 
        'You need active transaction history for 30 days before loan eligibility.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Request loan
router.post('/request', auth, async (req, res) => {
  try {
    const { amount, duration, purpose } = req.body;
    const user = await User.findById(req.user._id);
    
    const isEligible = user.firstTransferDate && 
      (new Date() - user.firstTransferDate) >= (30 * 24 * 60 * 60 * 1000);
    
    if (!isEligible) {
      return res.status(403).json({ 
        error: 'You need active transaction history for 30 days before loan eligibility.' 
      });
    }
    
    const loan = new LoanRequest({
      userId: user._id,
      userName: user.fullName,
      amount,
      duration,
      purpose
    });
    
    await loan.save();
    res.json({ message: 'Loan request submitted successfully', loan });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user loans
router.get('/my-loans', auth, async (req, res) => {
  try {
    const loans = await LoanRequest.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all loans (admin)
router.get('/all', adminAuth, async (req, res) => {
  try {
    const loans = await LoanRequest.find()
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update loan status (admin)
router.put('/:loanId', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const loan = await LoanRequest.findByIdAndUpdate(
      req.params.loanId,
      { status },
      { new: true }
    );
    res.json(loan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
