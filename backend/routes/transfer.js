const express = require('express');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const { sendTransferEmail } = require('../services/emailService');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Complete currency map matching frontend CURRENCY_META + FALLBACK_RATES
const CURRENCY_MAP = {
  USD: { flag: '🇺🇸', rate: '1.00', symbol: '$', name: 'US Dollar' },
  EUR: { flag: '🇪🇺', rate: '0.92', symbol: '€', name: 'Euro' },
  GBP: { flag: '🇬🇧', rate: '0.79', symbol: '£', name: 'British Pound' },
  NGN: { flag: '🇳🇬', rate: '1550.00', symbol: '₦', name: 'Nigerian Naira' },
  GHS: { flag: '🇬🇭', rate: '15.50', symbol: '₵', name: 'Ghana Cedi' },
  KES: { flag: '🇰🇪', rate: '132.00', symbol: 'KSh', name: 'Kenyan Shilling' },
  ZAR: { flag: '🇿🇦', rate: '18.70', symbol: 'R', name: 'South African Rand' },
  JPY: { flag: '🇯🇵', rate: '151.00', symbol: '¥', name: 'Japanese Yen' },
  CNY: { flag: '🇨🇳', rate: '7.24', symbol: '¥', name: 'Chinese Yuan' },
  INR: { flag: '🇮🇳', rate: '83.50', symbol: '₹', name: 'Indian Rupee' },
  CAD: { flag: '🇨🇦', rate: '1.36', symbol: 'C$', name: 'Canadian Dollar' },
  AUD: { flag: '🇦🇺', rate: '1.52', symbol: 'A$', name: 'Australian Dollar' },
  BRL: { flag: '🇧🇷', rate: '5.15', symbol: 'R$', name: 'Brazilian Real' },
  MXN: { flag: '🇲🇽', rate: '18.20', symbol: '$', name: 'Mexican Peso' },
  SGD: { flag: '🇸🇬', rate: '1.35', symbol: 'S$', name: 'Singapore Dollar' },
  AED: { flag: '🇦🇪', rate: '3.67', symbol: 'د.إ', name: 'UAE Dirham' },
  SAR: { flag: '🇸🇦', rate: '3.75', symbol: '﷼', name: 'Saudi Riyal' },
  CHF: { flag: '🇨🇭', rate: '0.88', symbol: 'Fr', name: 'Swiss Franc' },
  SEK: { flag: '🇸🇪', rate: '10.60', symbol: 'kr', name: 'Swedish Krona' },
  TRY: { flag: '🇹🇷', rate: '32.10', symbol: '₺', name: 'Turkish Lira' },
  COP: { flag: '🇨🇴', rate: '3900.00', symbol: '$', name: 'Colombian Peso' },
  ARS: { flag: '🇦🇷', rate: '890.00', symbol: '$', name: 'Argentine Peso' },
  CLP: { flag: '🇨🇱', rate: '920.00', symbol: '$', name: 'Chilean Peso' },
  PEN: { flag: '🇵🇪', rate: '3.70', symbol: 'S/', name: 'Peruvian Sol' },
  UYU: { flag: '🇺🇾', rate: '39.00', symbol: '$', name: 'Uruguayan Peso' },
  PYG: { flag: '🇵🇾', rate: '7500.00', symbol: '₲', name: 'Paraguayan Guarani' },
  BOB: { flag: '🇧🇴', rate: '6.90', symbol: 'Bs', name: 'Bolivian Boliviano' },
  DOP: { flag: '🇩🇴', rate: '59.00', symbol: 'RD$', name: 'Dominican Peso' },
  HNL: { flag: '🇭🇳', rate: '24.70', symbol: 'L', name: 'Honduran Lempira' },
  GTQ: { flag: '🇬🇹', rate: '7.80', symbol: 'Q', name: 'Guatemalan Quetzal' },
  CRC: { flag: '🇨🇷', rate: '520.00', symbol: '₡', name: 'Costa Rican Colon' },
  PAB: { flag: '🇵🇦', rate: '1.00', symbol: 'B/.', name: 'Panamanian Balboa' },
  JMD: { flag: '🇯🇲', rate: '157.00', symbol: 'J$', name: 'Jamaican Dollar' },
  TTD: { flag: '🇹🇹', rate: '6.80', symbol: 'TT$', name: 'Trinidad Dollar' },
  XCD: { flag: '🇦🇬', rate: '2.70', symbol: 'EC$', name: 'E.Caribbean Dollar' },
  XOF: { flag: '🇸🇳', rate: '605.00', symbol: 'CFA', name: 'W.African CFA' },
  MAD: { flag: '🇲🇦', rate: '10.00', symbol: 'DH', name: 'Moroccan Dirham' },
  EGP: { flag: '🇪🇬', rate: '47.50', symbol: 'E£', name: 'Egyptian Pound' },
  DZD: { flag: '🇩🇿', rate: '134.00', symbol: 'DA', name: 'Algerian Dinar' },
  ETB: { flag: '🇪🇹', rate: '56.00', symbol: 'Br', name: 'Ethiopian Birr' },
  UGX: { flag: '🇺🇬', rate: '3700.00', symbol: 'USh', name: 'Ugandan Shilling' },
  TZS: { flag: '🇹🇿', rate: '2600.00', symbol: 'TSh', name: 'Tanzanian Shilling' },
  RWF: { flag: '🇷🇼', rate: '1300.00', symbol: 'RF', name: 'Rwandan Franc' },
  ZMW: { flag: '🇿🇲', rate: '26.00', symbol: 'K', name: 'Zambian Kwacha' },
  MZN: { flag: '🇲🇿', rate: '63.00', symbol: 'MT', name: 'Mozambican Metical' },
  BWP: { flag: '🇧🇼', rate: '13.50', symbol: 'P', name: 'Botswana Pula' },
  MGA: { flag: '🇲🇬', rate: '4500.00', symbol: 'Ar', name: 'Malagasy Ariary' },
  AOA: { flag: '🇦🇴', rate: '915.00', symbol: 'Kz', name: 'Angolan Kwanza' },
  NZD: { flag: '🇳🇿', rate: '1.60', symbol: 'NZ$', name: 'New Zealand Dollar' },
  HKD: { flag: '🇭🇰', rate: '7.80', symbol: 'HK$', name: 'Hong Kong Dollar' },
  KRW: { flag: '🇰🇷', rate: '1300.00', symbol: '₩', name: 'South Korean Won' },
  IDR: { flag: '🇮🇩', rate: '15800.00', symbol: 'Rp', name: 'Indonesian Rupiah' },
  MYR: { flag: '🇲🇾', rate: '4.70', symbol: 'RM', name: 'Malaysian Ringgit' },
  PHP: { flag: '🇵🇭', rate: '56.00', symbol: '₱', name: 'Philippine Peso' },
  THB: { flag: '🇹🇭', rate: '36.00', symbol: '฿', name: 'Thai Baht' },
  VND: { flag: '🇻🇳', rate: '24500.00', symbol: '₫', name: 'Vietnamese Dong' },
  PKR: { flag: '🇵🇰', rate: '278.00', symbol: '₨', name: 'Pakistani Rupee' },
  BDT: { flag: '🇧🇩', rate: '109.00', symbol: '৳', name: 'Bangladeshi Taka' },
  LKR: { flag: '🇱🇰', rate: '300.00', symbol: '₨', name: 'Sri Lankan Rupee' },
  NPR: { flag: '🇳🇵', rate: '133.00', symbol: '₨', name: 'Nepalese Rupee' },
  MMK: { flag: '🇲🇲', rate: '2100.00', symbol: 'K', name: 'Myanmar Kyat' },
  KHR: { flag: '🇰🇭', rate: '4100.00', symbol: '៛', name: 'Cambodian Riel' },
  LAK: { flag: '🇱🇦', rate: '20500.00', symbol: '₭', name: 'Lao Kip' },
  MNT: { flag: '🇲🇳', rate: '3400.00', symbol: '₮', name: 'Mongolian Tugrik' },
  RUB: { flag: '🇷🇺', rate: '88.00', symbol: '₽', name: 'Russian Ruble' },
  PLN: { flag: '🇵🇱', rate: '4.00', symbol: 'zł', name: 'Polish Zloty' },
  CZK: { flag: '🇨🇿', rate: '23.00', symbol: 'Kč', name: 'Czech Koruna' },
  HUF: { flag: '🇭🇺', rate: '360.00', symbol: 'Ft', name: 'Hungarian Forint' },
  RON: { flag: '🇷🇴', rate: '4.60', symbol: 'lei', name: 'Romanian Leu' },
  BGN: { flag: '🇧🇬', rate: '1.80', symbol: 'лв', name: 'Bulgarian Lev' },
  HRK: { flag: '🇭🇷', rate: '6.90', symbol: 'kn', name: 'Croatian Kuna' },
  DKK: { flag: '🇩🇰', rate: '6.90', symbol: 'kr', name: 'Danish Krone' },
  NOK: { flag: '🇳🇴', rate: '10.60', symbol: 'kr', name: 'Norwegian Krone' },
  ISK: { flag: '🇮🇸', rate: '138.00', symbol: 'kr', name: 'Icelandic Krona' },
  GEL: { flag: '🇬🇪', rate: '2.70', symbol: '₾', name: 'Georgian Lari' },
  UAH: { flag: '🇺🇦', rate: '41.00', symbol: '₴', name: 'Ukrainian Hryvnia' },
  BYN: { flag: '🇧🇾', rate: '3.20', symbol: 'Br', name: 'Belarusian Ruble' },
  KZT: { flag: '🇰🇿', rate: '500.00', symbol: '₸', name: 'Kazakhstani Tenge' },
  UZS: { flag: '🇺🇿', rate: '12600.00', symbol: 'soʻm', name: 'Uzbekistani Som' },
  TJS: { flag: '🇹🇯', rate: '10.90', symbol: 'SM', name: 'Tajikistani Somoni' },
  KGS: { flag: '🇰🇬', rate: '87.00', symbol: 'с', name: 'Kyrgystani Som' },
  TMT: { flag: '🇹🇲', rate: '3.50', symbol: 'm', name: 'Turkmenistani Manat' },
  AZN: { flag: '🇦🇿', rate: '1.70', symbol: '₼', name: 'Azerbaijani Manat' },
  AMD: { flag: '🇦🇲', rate: '390.00', symbol: '֏', name: 'Armenian Dram' },
  ALL: { flag: '🇦🇱', rate: '93.00', symbol: 'L', name: 'Albanian Lek' },
  MKD: { flag: '🇲🇰', rate: '56.00', symbol: 'ден', name: 'Macedonian Denar' },
  BAM: { flag: '🇧🇦', rate: '1.80', symbol: 'KM', name: 'Bosnian Mark' },
  MDL: { flag: '🇲🇩', rate: '17.80', symbol: 'L', name: 'Moldovan Leu' },
  RSD: { flag: '🇷🇸', rate: '108.00', symbol: 'din', name: 'Serbian Dinar' },
  BHD: { flag: '🇧🇭', rate: '0.38', symbol: '.د.ب', name: 'Bahraini Dinar' },
  KWD: { flag: '🇰🇼', rate: '0.31', symbol: 'د.ك', name: 'Kuwaiti Dinar' },
  OMR: { flag: '🇴🇲', rate: '0.38', symbol: 'ر.ع.', name: 'Omani Rial' },
  QAR: { flag: '🇶🇦', rate: '3.64', symbol: 'ر.ق', name: 'Qatari Riyal' },
  JOD: { flag: '🇯🇴', rate: '0.71', symbol: 'د.ا', name: 'Jordanian Dinar' },
  IQD: { flag: '🇮🇶', rate: '1310.00', symbol: 'ع.د', name: 'Iraqi Dinar' },
  LBP: { flag: '🇱🇧', rate: '89500.00', symbol: 'ل.ل', name: 'Lebanese Pound' },
  SYP: { flag: '🇸🇾', rate: '13000.00', symbol: '£S', name: 'Syrian Pound' },
  YER: { flag: '🇾🇪', rate: '250.00', symbol: '﷼', name: 'Yemeni Rial' },
  AFN: { flag: '🇦🇫', rate: '71.00', symbol: '؋', name: 'Afghan Afghani' },
  IRR: { flag: '🇮🇷', rate: '42000.00', symbol: '﷼', name: 'Iranian Rial' },
  BND: { flag: '🇧🇳', rate: '1.35', symbol: 'B$', name: 'Brunei Dollar' },
  FJD: { flag: '🇫🇯', rate: '2.20', symbol: 'FJ$', name: 'Fijian Dollar' },
  PGK: { flag: '🇵🇬', rate: '3.80', symbol: 'K', name: 'Papua New Guinean Kina' },
  SBD: { flag: '🇸🇧', rate: '8.40', symbol: 'SI$', name: 'Solomon Islands Dollar' },
  TOP: { flag: '🇹🇴', rate: '2.30', symbol: 'T$', name: 'Tongan Paʻanga' },
  VUV: { flag: '🇻🇺', rate: '119.00', symbol: 'VT', name: 'Vanuatu Vatu' },
  WST: { flag: '🇼🇸', rate: '2.70', symbol: 'T', name: 'Samoan Tala' },
  KID: { flag: '🇰🇮', rate: '1.50', symbol: '$', name: 'Kiribati Dollar' },
  TVD: { flag: '🇹🇻', rate: '1.50', symbol: '$', name: 'Tuvaluan Dollar' },
  CUP: { flag: '🇨🇺', rate: '24.00', symbol: '$', name: 'Cuban Peso' },
  NIO: { flag: '🇳🇮', rate: '36.80', symbol: 'C$', name: 'Nicaraguan Cordoba' }
};

// Helper to safely get currency data
const getCurrencyData = (code) => {
  return CURRENCY_MAP[code] || CURRENCY_MAP['USD'];
};

router.get('/lookup-account/:accountNumber', auth, async (req, res) => {
  try {
    const cleanAccount = req.params.accountNumber.trim().replace(/\s/g, '');
    const user = await User.findOne({ accountNumber: cleanAccount }).select('fullName accountNumber');
    if (!user) return res.status(404).json({ error: 'No user found with this account number' });
    res.json({ found: true, fullName: user.fullName, accountNumber: user.accountNumber });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/internal', auth, async (req, res) => {
  try {
    const { recipientAccount, amount, narration, pin, targetCurrency, originalAmount, recipientEmail } = req.body;
    const sender = await User.findById(req.user._id);
    if (!sender) return res.status(404).json({ error: 'Sender not found' });
    if (sender.isLocked) return res.status(403).json({ error: 'Account locked. Contact support.' });
    if (!sender.transactionPin) return res.status(400).json({ error: 'Transaction PIN not set' });

    const isHashed = sender.transactionPin.startsWith('$2');
    let isPinValid = isHashed ? await bcrypt.compare(pin, sender.transactionPin) : pin === sender.transactionPin;
    if (!isPinValid) return res.status(400).json({ error: 'Invalid transaction PIN' });

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) return res.status(400).json({ error: 'Invalid amount' });
    if (sender.balance < transferAmount) return res.status(400).json({ error: 'Insufficient balance' });

    const cleanAccount = recipientAccount.toString().trim().replace(/\s/g, '');
    let receiver = await User.findOne({ accountNumber: cleanAccount });
    if (!receiver) return res.status(404).json({ error: 'No user found with this account number' });
    if (sender._id.toString() === receiver._id.toString()) return res.status(400).json({ error: 'Cannot transfer to yourself' });

    sender.balance -= transferAmount;
    receiver.balance += transferAmount;
    if (!sender.firstTransferDate) sender.firstTransferDate = new Date();
    await sender.save();
    await receiver.save();

    const reference = 'CRX' + uuidv4().substring(0, 12).toUpperCase();
    const transaction = new Transaction({
      senderId: sender._id, senderName: sender.fullName,
      receiverId: receiver._id, receiverName: receiver.fullName,
      receiverAccountNumber: receiver.accountNumber,
      amount: transferAmount, originalAmount: originalAmount || transferAmount,
      targetCurrency: targetCurrency || sender.currency, currency: sender.currency,
      narration, type: 'internal', reference, status: 'completed'
    });
    await transaction.save();

    await Notification.create({ userId: sender._id, title: 'Transfer Successful', message: `You sent ${sender.currency}${transferAmount.toLocaleString()} to ${receiver.fullName}` });
    await Notification.create({ userId: receiver._id, title: 'Money Received', message: `You received ${receiver.currency}${transferAmount.toLocaleString()} from ${sender.fullName}` });

    if (recipientEmail) {
      const curr = getCurrencyData(targetCurrency || sender.currency || 'USD');
      const rateNum = parseFloat(curr.rate);
      const convertedAmt = targetCurrency && targetCurrency !== 'USD' 
        ? (transferAmount * rateNum).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})
        : transferAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
      
      await sendTransferEmail(recipientEmail, {
        senderName: sender.fullName, senderAccount: sender.accountNumber,
        recipientName: receiver.fullName, recipientAccount: receiver.accountNumber,
        recipientBank: 'Credixa Banking', recipientEmail,
        amountUSD: transferAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}),
        amountConverted: `${curr.flag} ${convertedAmt}`, currencyCode: targetCurrency || sender.currency || 'USD',
        currencyFlag: curr.flag, exchangeRate: curr.rate, transactionId: reference,
        date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        narration: narration || null, status: 'Completed'
      });
    }

    res.json({ success: true, transaction: { reference, senderName: sender.fullName, senderAccountNumber: sender.accountNumber, receiverName: receiver.fullName, receiverAccountNumber: receiver.accountNumber, bankName: 'Credixa Banking', amount: transferAmount, originalAmount: originalAmount || transferAmount, targetCurrency: targetCurrency || sender.currency, currency: sender.currency, narration: narration || 'Internal Transfer', date: new Date().toISOString(), status: 'success' }});
  } catch (error) {
    console.error('[TRANSFER] Internal transfer error:', error);
    res.status(500).json({ error: error.message || 'Transfer failed' });
  }
});

router.post('/external', auth, async (req, res) => {
  try {
    const { bankName, accountNumber, accountName, amount, narration, pin, targetCurrency, originalAmount, recipientEmail } = req.body;
    const sender = await User.findById(req.user._id);
    if (!sender) return res.status(404).json({ error: 'Sender not found' });
    if (sender.isLocked) return res.status(403).json({ error: 'Account locked. Contact support.' });
    if (!sender.transactionPin) return res.status(400).json({ error: 'Transaction PIN not set' });

    const isHashed = sender.transactionPin.startsWith('$2');
    let isPinValid = isHashed ? await bcrypt.compare(pin, sender.transactionPin) : pin === sender.transactionPin;
    if (!isPinValid) return res.status(400).json({ error: 'Invalid transaction PIN' });

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) return res.status(400).json({ error: 'Invalid amount' });
    if (sender.balance < transferAmount) return res.status(400).json({ error: 'Insufficient balance' });

    sender.balance -= transferAmount;
    if (!sender.firstTransferDate) sender.firstTransferDate = new Date();
    await sender.save();

    const reference = 'CRX' + uuidv4().substring(0, 12).toUpperCase();
    const transaction = new Transaction({
      senderId: sender._id, senderName: sender.fullName,
      receiverName: accountName, receiverAccountNumber: accountNumber,
      receiverBankName: bankName, amount: transferAmount,
      originalAmount: originalAmount || transferAmount,
      targetCurrency: targetCurrency || sender.currency, currency: sender.currency,
      narration, type: 'external', reference, status: 'completed'
    });
    await transaction.save();

    await Notification.create({ userId: sender._id, title: 'External Transfer Sent', message: `You sent ${sender.currency}${transferAmount.toLocaleString()} to ${accountName} at ${bankName}` });

    if (recipientEmail) {
      const curr = getCurrencyData(targetCurrency || sender.currency || 'USD');
      const rateNum = parseFloat(curr.rate);
      const convertedAmt = targetCurrency && targetCurrency !== 'USD' 
        ? (transferAmount * rateNum).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})
        : transferAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
      
      await sendTransferEmail(recipientEmail, {
        senderName: sender.fullName, senderAccount: sender.accountNumber,
        recipientName: accountName, recipientAccount: accountNumber,
        recipientBank: bankName, recipientEmail,
        amountUSD: transferAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}),
        amountConverted: `${curr.flag} ${convertedAmt}`, currencyCode: targetCurrency || sender.currency || 'USD',
        currencyFlag: curr.flag, exchangeRate: curr.rate, transactionId: reference,
        date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        narration: narration || null, status: 'Completed'
      });
    }

    res.json({ success: true, transaction: { reference, senderName: sender.fullName, senderAccountNumber: sender.accountNumber, receiverName: accountName, receiverAccountNumber: accountNumber, bankName: bankName, amount: transferAmount, originalAmount: originalAmount || transferAmount, targetCurrency: targetCurrency || sender.currency, currency: sender.currency, narration: narration || 'External Transfer', date: new Date().toISOString(), status: 'success' }});
  } catch (error) {
    console.error('[TRANSFER] External transfer error:', error);
    res.status(500).json({ error: error.message || 'External transfer failed' });
  }
});

router.get('/history', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ $or: [{ senderId: req.user._id }, { receiverId: req.user._id }] }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
