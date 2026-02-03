import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Upload } from "@/lib/models/Upload";
import { unlink } from "fs/promises";
import path from "path";
import { logActivity } from "@/lib/logActivity";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const upload = await Upload.findById(id);

    if (!upload) {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      );
    }

    const filePath = path.join(process.cwd(), "public", upload.path);
    try {
      await unlink(filePath);
    } catch {
      console.warn("File already deleted from disk:", filePath);
    }

    await Upload.findByIdAndDelete(id);

    await logActivity({
      action: 'delete',
      entityType: 'file',
      entityId: id,
      entityName: upload.originalName,
    });

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Delete file error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
