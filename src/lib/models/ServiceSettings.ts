import mongoose from 'mongoose';

const ServiceSettingsSchema = new mongoose.Schema({
  musicPlayer: { type: Boolean, default: true },
  library: { type: Boolean, default: true },
  aiImage: { type: Boolean, default: true },
    tempMail: { type: Boolean, default: true },
    uploader: { type: Boolean, default: true },
    wanyzxAi: { type: Boolean, default: true },
    webParser: { type: Boolean, default: true },
  }, { timestamps: true });

export default mongoose.models.ServiceSettings || mongoose.model('ServiceSettings', ServiceSettingsSchema);
