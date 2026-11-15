const mongoose = require('mongoose');
const crypto = require('crypto');

const apiApplicationSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  environment: { type: String, enum: ['sandbox', 'production'], default: 'sandbox' },
  status: { type: String, enum: ['enabled', 'disabled'], default: 'enabled' },
  permissions: { type: [String], default: ['read:payments', 'write:payment_intents', 'read:webhooks'] },
  webhookUrl: { type: String, default: '' },
  collectionAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  collectionAccountNumber: { type: String, default: '' },
  collectionCurrency: { type: String, default: 'USD' },
  apiKey: { type: String, unique: true, sparse: true, index: true },
  apiSecretHash: { type: String, default: '' },
  apiSecretLast4: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastUsedAt: { type: Date, default: null },
  revokedAt: { type: Date, default: null },
  requestCount: { type: Number, default: 0 }
});

apiApplicationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

apiApplicationSchema.methods.compareSecret = function(secret) {
  if (!secret || !this.apiSecretHash) return false;
  const digest = crypto.createHash('sha256').update(String(secret)).digest('hex');
  const expected = Buffer.from(this.apiSecretHash, 'hex');
  const actual = Buffer.from(digest, 'hex');
  if (expected.length !== actual.length) return false;
  return crypto.timingSafeEqual(expected, actual);
};

apiApplicationSchema.methods.toPublicJSON = function() {
  const obj = this.toObject();
  delete obj.apiSecretHash;
  return obj;
};

module.exports = mongoose.model('ApiApplication', apiApplicationSchema);
