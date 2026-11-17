const mongoose = require('mongoose');

const paymentIntentSchema = new mongoose.Schema({
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'ApiApplication', required: true, index: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  reference: { type: String, required: true, unique: true, index: true },
  merchantName: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  environment: { type: String, enum: ['sandbox', 'production'], default: 'sandbox' },
  isSimulation: { type: Boolean, default: false },
  merchantCollectionAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  merchantCollectionAccountNumber: { type: String, default: '' },
  customerName: { type: String, default: '' },
  customerAccountNumber: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'authorized', 'completed', 'expired', 'failed'], default: 'pending' },
  webhookUrl: { type: String, default: '' },
  transferReference: { type: String, default: '' },
  idempotencyKey: { type: String, default: null },
  expiresAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  metadata: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

paymentIntentSchema.index(
  { applicationId: 1, idempotencyKey: 1 },
  { unique: true, partialFilterExpression: { idempotencyKey: { $type: 'string' } } }
);
paymentIntentSchema.index(
  { transferReference: 1 },
  { unique: true, partialFilterExpression: { transferReference: { $type: 'string', $gt: '' } } }
);

paymentIntentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('PaymentIntent', paymentIntentSchema);
