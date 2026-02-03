import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  name: { type: String, default: 'Wanyzx' },
  title: { type: String, default: 'Full Stack Developer' },
  bio: { type: String, default: 'Passionate developer creating amazing digital experiences' },
  avatar: { type: String, default: '/avatar.png' },
  email: { type: String, default: 'contact@wanyzx.com' },
  github: { type: String, default: 'https://github.com/wanyzx' },
  twitter: { type: String, default: '' },
  instagram: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  adminPassword: { type: String, default: 'admin123' },
  features: {
    wanyzxAi: { type: Boolean, default: true },
    webParser: { type: Boolean, default: true }
  }
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
