import mongoose from 'mongoose';

const TempMailSettingsSchema = new mongoose.Schema({
  limitPerIpPerDay: { type: Number, default: 5 },
  enabled: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.TempMailSettings || mongoose.model('TempMailSettings', TempMailSettingsSchema);
