import mongoose from 'mongoose';

const TempMailUsageSchema = new mongoose.Schema({
  ip: { type: String, required: true, index: true },
  date: { type: String, required: true, index: true },
  count: { type: Number, default: 0 },
}, { timestamps: true });

TempMailUsageSchema.index({ ip: 1, date: 1 }, { unique: true });

export default mongoose.models.TempMailUsage || mongoose.model('TempMailUsage', TempMailUsageSchema);
