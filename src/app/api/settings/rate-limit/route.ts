import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

const Settings = mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);

export async function GET(request: Request) {
  const isInternal = request.headers.get('x-internal-request') === 'true';
  
  try {
    await connectDB();
    
    const rateLimitSetting = await Settings.findOne({ key: 'rateLimit' });
    const windowHoursSetting = await Settings.findOne({ key: 'rateLimitWindowHours' });
    const spamLimitSetting = await Settings.findOne({ key: 'spamLimit' });
    const spamWindowSecondsSetting = await Settings.findOne({ key: 'spamWindowSeconds' });
    
    return NextResponse.json({
      rateLimit: rateLimitSetting?.value || 100,
      windowHours: windowHoursSetting?.value || 1,
      spamLimit: spamLimitSetting?.value || 5,
      spamWindowSeconds: spamWindowSecondsSetting?.value || 5,
    });
  } catch (error) {
    console.error("Error fetching rate limit settings:", error);
    return NextResponse.json({
      rateLimit: 100,
      windowHours: 1,
    });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    
    if (body.rateLimit !== undefined) {
      await Settings.findOneAndUpdate(
        { key: 'rateLimit' },
        { key: 'rateLimit', value: parseInt(body.rateLimit) },
        { upsert: true, new: true }
      );
    }
    
      if (body.windowHours !== undefined) {
        await Settings.findOneAndUpdate(
          { key: 'rateLimitWindowHours' },
          { key: 'rateLimitWindowHours', value: parseInt(body.windowHours) },
          { upsert: true, new: true }
        );
      }
      
      if (body.spamLimit !== undefined) {
        await Settings.findOneAndUpdate(
          { key: 'spamLimit' },
          { key: 'spamLimit', value: parseInt(body.spamLimit) },
          { upsert: true, new: true }
        );
      }
      
      if (body.spamWindowSeconds !== undefined) {
        await Settings.findOneAndUpdate(
          { key: 'spamWindowSeconds' },
          { key: 'spamWindowSeconds', value: parseInt(body.spamWindowSeconds) },
          { upsert: true, new: true }
        );
      }

    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving rate limit settings:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
