import mongoose from 'mongoose';

const RateLimitSchema = new mongoose.Schema({
  ip: { type: String, required: true },
  endpoint: { type: String, required: true },
  count: { type: Number, default: 1 },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

// TTL index: MongoDB will automatically delete documents where expiresAt is in the past
RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
RateLimitSchema.index({ ip: 1, endpoint: 1 }, { unique: true });

const RateLimit = mongoose.models.RateLimit || mongoose.model('RateLimit', RateLimitSchema);

export default RateLimit;

