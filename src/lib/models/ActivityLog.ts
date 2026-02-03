import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['create', 'update', 'delete', 'login', 'logout', 'view', 'upload'],
  },
  entityType: {
    type: String,
    required: true,
    enum: ['blog', 'product', 'project', 'skill', 'music', 'library', 'file', 'notification', 'settings', 'donation', 'request'],
  },
  entityId: { type: String },
  entityName: { type: String },
  description: { type: String },
  ip: { type: String },
  userAgent: { type: String },
  timestamp: { type: Date, default: Date.now, index: true },
});

ActivityLogSchema.index({ timestamp: -1 });
ActivityLogSchema.index({ entityType: 1, timestamp: -1 });

export const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema);
