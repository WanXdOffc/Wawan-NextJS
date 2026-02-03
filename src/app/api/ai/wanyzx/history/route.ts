import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import WanyzxChatSession from "@/lib/models/WanyzxChatSession";
import WanyzxChatMessage from "@/lib/models/WanyzxChatMessage";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    const ipAddress = req.headers.get("x-forwarded-for")?.split(',')[0] || req.ip || "127.0.0.1";

    // Auto-delete history older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Cleanup old sessions and their messages
    const oldSessions = await WanyzxChatSession.find({ createdAt: { $lt: thirtyDaysAgo } });
    if (oldSessions.length > 0) {
      const oldSessionIds = oldSessions.map(s => s.sessionId);
      await Promise.all([
        WanyzxChatSession.deleteMany({ sessionId: { $in: oldSessionIds } }),
        WanyzxChatMessage.deleteMany({ sessionId: { $in: oldSessionIds } })
      ]);
    }

    if (sessionId) {
      const messages = await WanyzxChatMessage.find({ sessionId }).sort({ createdAt: 1 });
      return NextResponse.json(messages);
    } else {
      const sessions = await WanyzxChatSession.find({ ipAddress }).sort({ updatedAt: -1 });
      return NextResponse.json(sessions);
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ success: false, error: "Session ID is required" }, { status: 400 });
    }

    await Promise.all([
      WanyzxChatSession.deleteOne({ sessionId }),
      WanyzxChatMessage.deleteMany({ sessionId })
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
