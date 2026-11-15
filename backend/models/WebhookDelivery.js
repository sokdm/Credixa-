const mongoose = require('mongoose');

const webhookDeliverySchema = new mongoose.Schema({
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'ApiApplication', required: true, index: true },
  eventType: { type: String, default: 'payment_intent_verified' },
  status: { type: String, enum: ['queued', 'sent', 'failed'], default: 'queued' },
  url: { type: String, default: '' },
  payload: { type: Object, default: {} },
  responseStatus: { type: Number, default: null },
  responseBody: { type: String, default: '' },
  attempts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

webhookDeliverySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('WebhookDelivery', webhookDeliverySchema);
