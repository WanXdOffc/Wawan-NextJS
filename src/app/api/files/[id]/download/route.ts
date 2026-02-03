import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Upload } from "@/lib/models/Upload";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    
    await Upload.findOneAndUpdate(
      { shortId: id },
      { $inc: { downloads: 1 } }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error incrementing download:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
