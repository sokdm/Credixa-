const mongoose = require('mongoose');

const webhookDeliverySchema = new mongoose.Schema({
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'ApiApplication', required: true, index: true },
  eventId: { type: String, required: true, unique: true, sparse: true, index: true },
  eventType: { type: String, required: true },
  status: { type: String, enum: ['queued', 'delivering', 'sent', 'failed'], default: 'queued' },
  url: { type: String, default: '' },
  payload: { type: Object, default: {} },
  responseStatus: { type: Number, default: null },
  responseBody: { type: String, default: '' },
  attempts: { type: Number, default: 0 },
  lastAttemptAt: { type: Date, default: null },
  nextAttemptAt: { type: Date, default: Date.now, index: true },
  lastError: { type: String, default: '' },
  deliveredAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

webhookDeliverySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('WebhookDelivery', webhookDeliverySchema);
