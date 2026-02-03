import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import LibraryCode from "@/lib/models/LibraryCode";
import { logActivity } from "@/lib/logActivity";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    
    const code = await LibraryCode.findById(id);
    if (!code) {
      return NextResponse.json(
        { success: false, error: "Code not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: code });
  } catch (error) {
    console.error("Admin library fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch code" },
      { status: 500 }
    );
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
    const { title, description, language, hashtags, code, exampleUsage, output, accessType, password, downloadUrl, downloadType } = body;

    const updateData: Record<string, unknown> = {
      title,
      description,
      progLanguage: language,
      hashtags: hashtags || [],
      code,
      exampleUsage,
      output,
      accessType: accessType || 'free',
      downloadUrl,
      downloadType: downloadType || 'code',
    };

    if (accessType === 'password' && password) {
      updateData.password = password;
    } else if (accessType === 'free') {
      updateData.password = undefined;
    }

    const updated = await LibraryCode.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Code not found" },
        { status: 404 }
      );
    }

    await logActivity({
      action: 'update',
      entityType: 'library',
      entityId: id,
      entityName: title,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Admin library update error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update code" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    
    const deleted = await LibraryCode.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Code not found" },
        { status: 404 }
      );
    }

    await logActivity({
      action: 'delete',
      entityType: 'library',
      entityId: id,
      entityName: deleted.title,
    });

    return NextResponse.json({ success: true, message: "Code deleted" });
  } catch (error) {
    console.error("Admin library delete error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete code" },
      { status: 500 }
    );
  }
}
