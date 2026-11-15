const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
 senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
 senderName: { type: String, required: true },
 receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
 receiverName: { type: String, required: true },
 receiverAccountNumber: { type: String },
 receiverBankName: { type: String },
 receiverCountry: { type: String, default: '' },
 amount: { type: Number, required: true },
 originalAmount: { type: Number, default: null },
 targetCurrency: { type: String, default: 'USD' },
 indicativeExchangeRate: { type: Number, default: null },
 indicativeAmount: { type: Number, default: null },
 currency: { type: String, default: 'USD' },
 narration: { type: String, default: '' },
 category: { type: String, default: 'other' },
 type: { type: String, enum: ['internal', 'external', 'admin'], required: true },
 isSimulation: { type: Boolean, default: false },
 reference: { type: String, required: true, unique: true },
 status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
 createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
