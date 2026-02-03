import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Upload } from "@/lib/models/Upload";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string[] }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const shortId = id[0];

    const upload = await Upload.findOne({ shortId });

    if (!upload) {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      );
    }

    const filePath = path.join(process.cwd(), "public", upload.path);
    
    try {
      const fileBuffer = await readFile(filePath);
      
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": upload.mimeType,
          "Content-Disposition": `inline; filename="${upload.originalName}"`,
          "Content-Length": upload.size.toString(),
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch {
      return NextResponse.json(
        { success: false, error: "File not found on disk" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Raw file error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to serve file" },
      { status: 500 }
    );
  }
}
