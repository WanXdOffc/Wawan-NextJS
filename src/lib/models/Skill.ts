import mongoose from 'mongoose';

const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  percentage: { type: Number, required: true, min: 0, max: 100 },
  icon: { type: String, default: '' },
  category: { type: String, default: 'general' },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Skill || mongoose.model('Skill', SkillSchema);
