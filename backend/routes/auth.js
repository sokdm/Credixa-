const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const router = express.Router();

const generateAccountNumber = () => {
  return '30' + Math.floor(1000000000 + Math.random() * 9000000000);
};

router.post('/register', async (req, res) => {
  try {
    const { fullName, phoneNumber, email, password, country, transactionPin } = req.body;
    console.log(`[AUTH] Registration attempt: ${email}, phone: ${phoneNumber}`);

    const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existingUser) {
      console.log(`[AUTH] User already exists: ${email}`);
      return res.status(400).json({ error: 'Email or phone already registered' });
    }

    const accountNumber = generateAccountNumber();
    console.log(`[AUTH] Generated account number: ${accountNumber}`);

    // Hash the transaction PIN
    const hashedPin = await bcrypt.hash(transactionPin, 12);
    console.log(`[AUTH] PIN hashed successfully, starts with: ${hashedPin.substring(0, 10)}...`);

    const user = new User({
      fullName,
      phoneNumber,
      email,
      password,
      country,
      transactionPin: hashedPin,
      accountNumber,
      balance: 0,
      currency: '$'
    });

    await user.save();
    console.log(`[AUTH] User saved successfully: ${user._id}`);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        accountNumber: user.accountNumber,
        balance: user.balance,
        currency: user.currency,
        country: user.country,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('[AUTH] Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`[AUTH] Login attempt: ${email}`);

    const user = await User.findOne({
      $or: [{ email }, { phoneNumber: email }]
    });

    if (!user || !(await user.comparePassword(password))) {
      console.log(`[AUTH] Invalid credentials for: ${email}`);
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    console.log(`[AUTH] Login successful: ${user._id}`);
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        accountNumber: user.accountNumber,
        balance: user.balance,
        currency: user.currency,
        country: user.country,
        isLocked: user.isLocked,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('[AUTH] Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
