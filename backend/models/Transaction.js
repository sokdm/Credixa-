const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  sender: { type: String },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  senderName: { type: String },
  receiver: { type: String },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiverName: { type: String },
  receiverAccountNumber: { type: String },
  receiverBankName: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: '$' },
  type: { type: String, enum: ['internal', 'external', 'admin', 'credit', 'debit'], default: 'internal' },
  description: { type: String, default: '' },
  narration: { type: String },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  reference: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
