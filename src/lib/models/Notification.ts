import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['info', 'warning', 'error', 'success', 'announcement'],
    default: 'info' 
  },
  mediaType: { 
    type: String, 
    enum: ['none', 'image', 'gif', 'audio'],
    default: 'none' 
  },
  mediaUrl: { type: String, default: '' },
  active: { type: Boolean, default: true },
  showOnce: { type: Boolean, default: false },
  expiresAt: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
