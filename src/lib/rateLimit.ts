import { connectDB } from "./mongodb";
import mongoose from "mongoose";
import RateLimitTrack from "./models/RateLimitTrack";

// We'll reuse the Settings model from the API route for now to avoid conflicts
// but ideally we should have a unified Settings model.
const SettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

const Settings = mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);

export async function checkRateLimit(ip: string, endpoint: string) {
  try {
    await connectDB();

    // Get settings
    const spamLimitSetting = await Settings.findOne({ key: 'spamLimit' });
    const spamWindowSecondsSetting = await Settings.findOne({ key: 'spamWindowSeconds' });

    const limit = spamLimitSetting?.value || 5;
    const windowSeconds = spamWindowSecondsSetting?.value || 5;

    const now = new Date();
    
    // Find existing track
    let track = await RateLimitTrack.findOne({ ip, endpoint });

    if (!track) {
      // Create new track
      track = await RateLimitTrack.create({
        ip,
        endpoint,
        count: 1,
        expireAt: new Date(now.getTime() + windowSeconds * 1000)
      });
      return { allowed: true, remaining: limit - 1 };
    }

    if (track.count >= limit) {
      const waitSeconds = Math.ceil((track.expireAt.getTime() - now.getTime()) / 1000);
      return { 
        allowed: false, 
        remaining: 0, 
        waitSeconds: waitSeconds > 0 ? waitSeconds : 1 
      };
    }

    // Increment count
    track.count += 1;
    await track.save();

    return { allowed: true, remaining: limit - track.count };
  } catch (error) {
    console.error("Rate limit check error:", error);
    return { allowed: true, remaining: 1 }; // Default to allowed on error
  }
}
