import mongoose, { Schema, Document } from 'mongoose';

export interface ILibraryCode extends Document {
  title: string;
  description: string;
  progLanguage: string;
  hashtags: string[];
  code: string;
  exampleUsage?: string;
  output?: string;
  accessType: 'free' | 'password';
  password?: string;
  downloadUrl?: string;
  downloadType?: 'code' | 'zip';
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const LibraryCodeSchema = new Schema<ILibraryCode>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  progLanguage: { type: String, required: true },
  hashtags: [{ type: String }],
  code: { type: String, required: true },
  exampleUsage: { type: String },
  output: { type: String },
  accessType: { type: String, enum: ['free', 'password'], default: 'free' },
  password: { type: String },
  downloadUrl: { type: String },
  downloadType: { type: String, enum: ['code', 'zip'], default: 'code' },
  views: { type: Number, default: 0 },
}, { timestamps: true });

LibraryCodeSchema.index({ progLanguage: 1 });
LibraryCodeSchema.index({ hashtags: 1 });

export const LibraryCode = mongoose.models.LibraryCode || mongoose.model<ILibraryCode>('LibraryCode', LibraryCodeSchema);
export default LibraryCode;
