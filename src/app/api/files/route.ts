import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Upload } from "@/lib/models/Upload";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";

function generateShortId(): string {
  return nanoid(8);
}

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_").substring(0, 100);
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "File size exceeds 100MB limit" },
        { status: 400 }
      );
    }

    const shortId = generateShortId();
    const originalName = file.name;
    const sanitizedName = sanitizeFilename(originalName);
    const ext = path.extname(sanitizedName);
    const storedFilename = `${shortId}${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, storedFilename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const upload = await Upload.create({
      shortId,
      filename: storedFilename,
      originalName,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      path: `/uploads/${storedFilename}`,
      downloads: 0,
      expiresAt,
    });

    const baseUrl = request.headers.get("x-forwarded-host") 
      ? `https://${request.headers.get("x-forwarded-host")}`
      : request.headers.get("host")
        ? `${request.headers.get("x-forwarded-proto") || "http"}://${request.headers.get("host")}`
        : "";

    const previewUrl = `${baseUrl}/f/${shortId}`;
    const rawUrl = `${baseUrl}/raw/${shortId}/${encodeURIComponent(originalName)}`;
    const directUrl = `${baseUrl}/uploads/${storedFilename}`;
    const downloadUrl = `${baseUrl}/dl/${shortId}`;

    const htmlEmbed = file.type?.startsWith("image/")
      ? `<img src="${rawUrl}" alt="${originalName}" />`
      : file.type?.startsWith("video/")
        ? `<video src="${rawUrl}" controls></video>`
        : file.type?.startsWith("audio/")
          ? `<audio src="${rawUrl}" controls></audio>`
          : `<a href="${rawUrl}" download>${originalName}</a>`;

    return NextResponse.json({
      success: true,
      result: {
        id: upload._id,
        shortId,
        filename: originalName,
        mimeType: file.type,
        size: file.size,
        previewUrl,
        rawUrl,
        directUrl,
        downloadUrl,
        htmlEmbed,
        expiresAt: upload.expiresAt,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const count = await Upload.countDocuments();
    return NextResponse.json({
      success: true,
      message: "File upload API",
      totalFiles: count,
      maxSize: "100MB",
      retention: "30 days",
    });
  } catch {
    return NextResponse.json({
      success: true,
      message: "File upload API",
      maxSize: "100MB",
      retention: "30 days",
    });
  }
}
