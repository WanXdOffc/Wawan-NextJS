import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/lib/models/Notification";
import { logActivity } from "@/lib/logActivity";

export async function GET() {
  try {
    await connectDB();
    const notifications = await Notification.find().sort({ createdAt: -1 });
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ notifications: [] });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const notification = await Notification.create(body);
    
    await logActivity({
      action: 'create',
      entityType: 'notification',
      entityId: notification._id.toString(),
      entityName: notification.title || notification.message,
    });
    
    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
}
