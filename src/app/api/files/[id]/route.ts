import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Upload } from "@/lib/models/Upload";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const upload = await Upload.findOne({ shortId: id });

    if (!upload) {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      );
    }

    const baseUrl = request.headers.get("x-forwarded-host")
      ? `https://${request.headers.get("x-forwarded-host")}`
      : request.headers.get("host")
        ? `${request.headers.get("x-forwarded-proto") || "http"}://${request.headers.get("host")}`
        : "";

    return NextResponse.json({
      success: true,
      result: {
        id: upload._id,
        shortId: upload.shortId,
        filename: upload.originalName,
        mimeType: upload.mimeType,
        size: upload.size,
        previewUrl: `${baseUrl}/f/${upload.shortId}`,
        rawUrl: `${baseUrl}/raw/${upload.shortId}/${encodeURIComponent(upload.originalName)}`,
        directUrl: `${baseUrl}${upload.path}`,
        createdAt: upload.createdAt,
        expiresAt: upload.expiresAt,
      },
    });
  } catch (error) {
    console.error("Get file error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get file info" },
      { status: 500 }
    );
  }
}
