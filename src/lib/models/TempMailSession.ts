import mongoose, { Schema, Document } from 'mongoose';

export interface ITempMailSession extends Document {
  ip: string;
  email: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
}

const TempMailSessionSchema = new Schema<ITempMailSession>({
  ip: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, index: true },
});

TempMailSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.TempMailSession || mongoose.model<ITempMailSession>('TempMailSession', TempMailSessionSchema);
