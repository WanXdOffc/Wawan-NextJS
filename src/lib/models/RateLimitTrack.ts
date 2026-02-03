import mongoose from 'mongoose';

const RateLimitTrackSchema = new mongoose.Schema({
  ip: { type: String, required: true },
  endpoint: { type: String, required: true },
  count: { type: Number, default: 1 },
  expireAt: { type: Date, required: true },
}, { timestamps: true });

// Index for automatic deletion after expireAt
RateLimitTrackSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
// Index for fast lookup
RateLimitTrackSchema.index({ ip: 1, endpoint: 1 });

export default mongoose.models.RateLimitTrack || mongoose.model('RateLimitTrack', RateLimitTrackSchema);
