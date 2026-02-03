import mongoose from 'mongoose';

const AnalyticsSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true,
    enum: ['api_request', 'page_view'],
    index: true 
  },
  path: { type: String, required: true, index: true },
  method: { type: String },
  statusCode: { type: Number },
  ip: { type: String },
  userAgent: { type: String },
  referer: { type: String },
  responseTime: { type: Number },
  timestamp: { type: Date, default: Date.now, index: true },
});

AnalyticsSchema.index({ timestamp: -1 });
AnalyticsSchema.index({ type: 1, timestamp: -1 });

export const Analytics = mongoose.models.Analytics || mongoose.model('Analytics', AnalyticsSchema);
