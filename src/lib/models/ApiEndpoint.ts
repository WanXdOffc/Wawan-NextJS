import mongoose from 'mongoose';

const ParameterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  required: { type: Boolean, default: false },
  description: { type: String, default: '' },
});

const ApiEndpointSchema = new mongoose.Schema({
  name: { type: String, required: true },
  endpoint: { type: String, required: true },
  method: { type: String, enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], default: 'GET' },
  status: { type: String, enum: ['active', 'inactive', 'maintenance'], default: 'active' },
  description: { type: String, default: '' },
  usage: { type: String, default: '' },
  parameters: [ParameterSchema],
  exampleResponse: { type: String, default: '' },
  category: { type: String, default: 'general' },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.ApiEndpoint || mongoose.model('ApiEndpoint', ApiEndpointSchema);
