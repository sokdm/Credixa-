const mongoose = require('mongoose');

const apiRequestLogSchema = new mongoose.Schema({
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'ApiApplication', required: true, index: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  method: { type: String, required: true },
  path: { type: String, required: true },
  statusCode: { type: Number, required: true },
  durationMs: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

apiRequestLogSchema.index({ applicationId: 1, createdAt: -1 });
apiRequestLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

module.exports = mongoose.model('APIRequestLog', apiRequestLogSchema);
