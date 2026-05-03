const mongoose = require('mongoose');

const supportMessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String },
  subject: { type: String },
  category: { type: String, default: 'other' },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  messages: [{
    sender: { type: String, enum: ['user', 'admin'], required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SupportMessage', supportMessageSchema);
