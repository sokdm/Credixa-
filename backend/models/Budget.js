const mongoose = require('mongoose');
const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  limit: { type: Number, required: true },
  spent: { type: Number, default: 0 },
  color: { type: String, default: 'bg-violet-500' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Budget', budgetSchema);
