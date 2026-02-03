import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/lib/models/Notification";
import { logActivity } from "@/lib/logActivity";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const notification = await Notification.findById(id);
    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }
    return NextResponse.json({ notification });
  } catch (error) {
    console.error("Error fetching notification:", error);
    return NextResponse.json({ error: "Failed to fetch notification" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const notification = await Notification.findByIdAndUpdate(id, body, { new: true });
    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }
    
    await logActivity({
      action: 'update',
      entityType: 'notification',
      entityId: id,
      entityName: notification.title || notification.message,
    });
    
    return NextResponse.json({ notification });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const notification = await Notification.findByIdAndDelete(id);
    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }
    
    await logActivity({
      action: 'delete',
      entityType: 'notification',
      entityId: id,
      entityName: notification.title || notification.message,
    });
    
    return NextResponse.json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 });
  }
}
