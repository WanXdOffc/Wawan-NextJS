import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import WanyzxChatSession from "@/lib/models/WanyzxChatSession";
import WanyzxChatMessage from "@/lib/models/WanyzxChatMessage";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = await params;

    const session = await WanyzxChatSession.findById(id);
    if (!session) {
      return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 });
    }

    await Promise.all([
      WanyzxChatSession.findByIdAndDelete(id),
      WanyzxChatMessage.deleteMany({ sessionId: session.sessionId })
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
