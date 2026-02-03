import mongoose from 'mongoose';

const MusicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  spotifyUrl: { type: String, required: true },
  coverImage: { type: String, default: '' },
  duration: { type: String, default: '' },
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Music || mongoose.model('Music', MusicSchema);
