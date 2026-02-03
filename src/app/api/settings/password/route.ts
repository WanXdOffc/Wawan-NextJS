import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

const Settings = mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);

const DEFAULT_PASSWORD = "wanyzx123";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    const passwordSetting = await Settings.findOne({ key: 'adminPassword' });
    const storedPassword = passwordSetting?.value || DEFAULT_PASSWORD;

    if (currentPassword !== storedPassword) {
      return NextResponse.json(
        { error: "Password saat ini salah!" },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password baru minimal 6 karakter!" },
        { status: 400 }
      );
    }

    await Settings.findOneAndUpdate(
      { key: 'adminPassword' },
      { key: 'adminPassword', value: newPassword },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, message: "Password berhasil diubah!" });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Gagal mengubah password!" },
      { status: 500 }
    );
  }
}
