import mongoose from 'mongoose';

const PaymentMethodSchema = new mongoose.Schema({
  type: { type: String, required: true },
  name: { type: String, required: true },
  value: { type: String, required: true },
  accountName: { type: String, default: '' },
  qrisImage: { type: String, default: '' },
  enabled: { type: Boolean, default: true },
});

const DonationSettingsSchema = new mongoose.Schema({
  paymentMethods: [PaymentMethodSchema],
  thankYouMessage: { type: String, default: 'Terima kasih atas dukungannya!' },
}, { timestamps: true });

const DonationSubmissionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  nominal: { type: Number, required: true },
  screenshot: { type: String, required: true },
  message: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
}, { timestamps: true });

export const DonationSettings = mongoose.models.DonationSettings || mongoose.model('DonationSettings', DonationSettingsSchema);
export const DonationSubmission = mongoose.models.DonationSubmission || mongoose.model('DonationSubmission', DonationSubmissionSchema);
