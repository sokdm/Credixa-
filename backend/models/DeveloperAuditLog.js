const mongoose = require('mongoose');

const developerAuditLogSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'ApiApplication', default: null, index: true },
  action: { type: String, required: true, maxlength: 80 },
  details: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('DeveloperAuditLog', developerAuditLogSchema);
