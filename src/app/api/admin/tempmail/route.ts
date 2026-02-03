import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TempMailSettings from "@/lib/models/TempMailSettings";

export async function GET() {
  try {
    await connectDB();
    let settings = await TempMailSettings.findOne();
    if (!settings) {
      settings = await TempMailSettings.create({ limitPerIpPerDay: 5, enabled: true });
    }
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error fetching tempmail settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    
    let settings = await TempMailSettings.findOne();
    if (!settings) {
      settings = await TempMailSettings.create(body);
    } else {
      settings = await TempMailSettings.findOneAndUpdate({}, body, { new: true });
    }
    
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error updating tempmail settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
