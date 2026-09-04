const mongoose = require('mongoose');

const internalCheckSchema = new mongoose.Schema({
  checkId: { type: String, required: true, unique: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issuerName: { type: String, required: true },
  issuerAccountNumber: { type: String, default: '' },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipientName: { type: String, required: true },
  recipientEmail: { type: String, required: true },
  recipientAccountNumber: { type: String, default: '' },
  amount: { type: Number, required: true, min: 0.01 },
  currency: { type: String, required: true, maxlength: 8 },
  memo: { type: String, default: '', maxlength: 240 },
  status: { type: String, enum: ['created', 'pending', 'deposited', 'cancelled', 'expired'], default: 'created' },
  issuedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: null },
  depositedAt: { type: Date, default: null },
  depositedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdAt: { type: Date, default: Date.now }
});

internalCheckSchema.index({ recipientId: 1, status: 1 });

module.exports = mongoose.model('InternalCheck', internalCheckSchema);
