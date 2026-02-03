import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    request: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    screenshot: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "completed", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

requestSchema.index({ email: 1, createdAt: -1 });
requestSchema.index({ ipAddress: 1, createdAt: -1 });

export default mongoose.models.Request || mongoose.model("Request", requestSchema);
