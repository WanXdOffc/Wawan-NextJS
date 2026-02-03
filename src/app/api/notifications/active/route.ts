import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/lib/models/Notification";

export async function GET() {
  try {
    await connectDB();
    const now = new Date();
    
    const notification = await Notification.findOne({
      active: true,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: now } }
      ]
    }).sort({ createdAt: -1 });
    
    if (!notification) {
      return NextResponse.json({ notification: null });
    }
    
    return NextResponse.json({ notification });
  } catch (error) {
    console.error("Error fetching active notification:", error);
    return NextResponse.json({ notification: null });
  }
}
