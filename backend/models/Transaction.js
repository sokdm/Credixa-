const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiverName: { type: String, required: true },
  receiverAccountNumber: { type: String },
  receiverBankName: { type: String },
  amount: { type: Number, required: true },
  originalAmount: { type: Number, default: null },
  targetCurrency: { type: String, default: 'USD' },
  currency: { type: String, default: 'USD' },
  narration: { type: String, default: '' },
  type: { type: String, enum: ['internal', 'external'], required: true },
  reference: { type: String, required: true, unique: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
