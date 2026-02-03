import mongoose, { Schema, Document } from 'mongoose';

export interface IUpload extends Document {
  shortId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  downloads: number;
  createdAt: Date;
  expiresAt: Date;
}

const UploadSchema = new Schema<IUpload>({
  shortId: { type: String, required: true, unique: true, index: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  path: { type: String, required: true },
  downloads: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

UploadSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Upload = mongoose.models.Upload || mongoose.model<IUpload>('Upload', UploadSchema);
