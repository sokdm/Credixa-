const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendOTPEmail } = require('../services/emailService');
const router = express.Router();

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Request password reset OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ error: 'No account found with this email' });

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.passwordResetOTP = otp;
    user.passwordResetOTPExpiry = expiry;
    await user.save();

    await sendOTPEmail(email, {
      userName: user.fullName,
      otpCode: otp,
      otpType: 'password',
      expiryMinutes: 10
    });

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    console.error('[OTP] Forgot password error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify password reset OTP
router.post('/verify-password-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.passwordResetOTP !== otp) return res.status(400).json({ error: 'Invalid OTP' });
    if (new Date() > user.passwordResetOTPExpiry) return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });

    res.json({ success: true, message: 'OTP verified', verified: true });
  } catch (error) {
    console.error('[OTP] Verify password OTP error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ error: 'All fields are required' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.passwordResetOTP !== otp) return res.status(400).json({ error: 'Invalid OTP' });
    if (new Date() > user.passwordResetOTPExpiry) return res.status(400).json({ error: 'OTP has expired' });

    user.password = newPassword;
    user.passwordResetOTP = null;
    user.passwordResetOTPExpiry = null;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully. Please login with your new password.' });
  } catch (error) {
    console.error('[OTP] Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Request PIN reset OTP
router.post('/forgot-pin', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ error: 'No account found with this email' });

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.pinResetOTP = otp;
    user.pinResetOTPExpiry = expiry;
    await user.save();

    await sendOTPEmail(email, {
      userName: user.fullName,
      otpCode: otp,
      otpType: 'pin',
      expiryMinutes: 10
    });

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    console.error('[OTP] Forgot PIN error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify PIN reset OTP
router.post('/verify-pin-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.pinResetOTP !== otp) return res.status(400).json({ error: 'Invalid OTP' });
    if (new Date() > user.pinResetOTPExpiry) return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });

    res.json({ success: true, message: 'OTP verified', verified: true });
  } catch (error) {
    console.error('[OTP] Verify PIN OTP error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Reset PIN
router.post('/reset-pin', async (req, res) => {
  try {
    const { email, otp, newPin } = req.body;
    if (!email || !otp || !newPin) return res.status(400).json({ error: 'All fields are required' });
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) return res.status(400).json({ error: 'PIN must be exactly 4 digits' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.pinResetOTP !== otp) return res.status(400).json({ error: 'Invalid OTP' });
    if (new Date() > user.pinResetOTPExpiry) return res.status(400).json({ error: 'OTP has expired' });

    const hashedPin = await bcrypt.hash(newPin, 12);
    user.transactionPin = hashedPin;
    user.pinResetOTP = null;
    user.pinResetOTPExpiry = null;
    await user.save();

    res.json({ success: true, message: 'PIN reset successfully' });
  } catch (error) {
    console.error('[OTP] Reset PIN error:', error);
    res.status(500).json({ error: 'Failed to reset PIN' });
  }
});

module.exports = router;
