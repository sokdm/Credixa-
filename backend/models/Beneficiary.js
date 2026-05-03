const mongoose = require('mongoose');
const beneficiarySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  account: { type: String, required: true },
  bank: { type: String, required: true },
  type: { type: String, enum: ['individual', 'business'], default: 'individual' },
  favorite: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Beneficiary', beneficiarySchema);
