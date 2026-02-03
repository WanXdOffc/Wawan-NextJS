import mongoose from 'mongoose';

const WanyzxChatMessageSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: false, default: "" },
  model: { type: String },
  type: { type: String, default: 'text' }, // text, image, file, vision
  metadata: { type: Object },
}, { timestamps: true });

export default mongoose.models.WanyzxChatMessage || mongoose.model('WanyzxChatMessage', WanyzxChatMessageSchema);
