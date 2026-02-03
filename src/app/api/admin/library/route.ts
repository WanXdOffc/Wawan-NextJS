import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import LibraryCode from "@/lib/models/LibraryCode";
import { logActivity } from "@/lib/logActivity";

export async function GET() {
  try {
    await connectDB();
    
    const codes = await LibraryCode.find()
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: codes });
  } catch (error) {
    console.error("Admin library fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch library" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { title, description, language, hashtags, code, exampleUsage, output, accessType, password, downloadUrl, downloadType } = body;

    if (!title || !description || !language || !code) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newCode = await LibraryCode.create({
      title,
      description,
      progLanguage: language,
      hashtags: hashtags || [],
      code,
      exampleUsage,
      output,
      accessType: accessType || 'free',
      password: accessType === 'password' ? password : undefined,
      downloadUrl,
      downloadType: downloadType || 'code',
    });

    await logActivity({
      action: 'create',
      entityType: 'library',
      entityId: newCode._id.toString(),
      entityName: title,
    });

    return NextResponse.json({ success: true, data: newCode }, { status: 201 });
  } catch (error) {
    console.error("Admin library create error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create code" },
      { status: 500 }
    );
  }
}
