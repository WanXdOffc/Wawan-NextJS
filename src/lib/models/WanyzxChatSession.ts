import mongoose from 'mongoose';

const WanyzxChatSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  title: { type: String, default: 'New Chat' },
  lastMessage: { type: String, default: '' },
  userId: { type: String, default: 'anonymous' },
  ipAddress: { type: String, index: true },
}, { timestamps: true });

export default mongoose.models.WanyzxChatSession || mongoose.model('WanyzxChatSession', WanyzxChatSessionSchema);
