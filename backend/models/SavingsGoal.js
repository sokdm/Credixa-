const mongoose = require('mongoose');
const savingsGoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  target: { type: Number, required: true },
  saved: { type: Number, default: 0 },
  icon: { type: String, default: '🎯' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('SavingsGoal', savingsGoalSchema);
