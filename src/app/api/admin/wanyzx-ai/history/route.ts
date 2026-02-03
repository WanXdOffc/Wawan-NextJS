import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import WanyzxChatSession from "@/lib/models/WanyzxChatSession";

export async function GET() {
  try {
    await connectDB();
    const sessions = await WanyzxChatSession.find().sort({ updatedAt: -1 });
    return NextResponse.json({ success: true, sessions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
