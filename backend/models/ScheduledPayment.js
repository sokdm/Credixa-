const mongoose = require('mongoose');

const scheduledPaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  frequency: { type: String, enum: ['daily', 'weekly', 'bi-weekly', 'monthly', 'yearly'], default: 'monthly' },
  nextDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'paused'], default: 'active' },
  category: { type: String, default: 'other' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ScheduledPayment', scheduledPaymentSchema);
