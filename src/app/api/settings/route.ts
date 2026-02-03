import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

const Settings = mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);

export async function GET() {
  try {
    await connectDB();
    const settings = await Settings.find();
    const result: Record<string, unknown> = {};
    settings.forEach((s: { key: string; value: unknown }) => {
      result[s.key] = s.value;
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({});
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    
    for (const [key, value] of Object.entries(body)) {
      await Settings.findOneAndUpdate(
        { key },
        { key, value },
        { upsert: true, new: true }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
