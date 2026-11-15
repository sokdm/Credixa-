const mongoose = require('mongoose');

const paymentIntentSchema = new mongoose.Schema({
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'ApiApplication', required: true, index: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  reference: { type: String, required: true, unique: true, index: true },
  merchantName: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  merchantCollectionAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  merchantCollectionAccountNumber: { type: String, default: '' },
  customerName: { type: String, default: '' },
  customerAccountNumber: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'authorized', 'completed', 'expired', 'failed'], default: 'pending' },
  webhookUrl: { type: String, default: '' },
  transferReference: { type: String, default: '' },
  metadata: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

paymentIntentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('PaymentIntent', paymentIntentSchema);
