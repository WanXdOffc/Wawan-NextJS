import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

function generateRandomCode(length: number = 8): string {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
}

function getContentType(ext: string): string {
  const types: Record<string, string> = {
    ".mp4": "video/mp4",
    ".mp3": "audio/mpeg",
    ".webm": "video/webm",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".pdf": "application/pdf",
    ".wav": "audio/wav",
    ".ogg": "audio/ogg",
    ".m4a": "audio/mp4",
  };
  return types[ext.toLowerCase()] || "application/octet-stream";
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    
    let buffer: Buffer;
    let originalFilename = "file";
    let ext = ".bin";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      
      if (!file) {
        return NextResponse.json(
          { success: false, error: "No file provided" },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
      originalFilename = file.name;
      ext = path.extname(file.name) || ".bin";
    } else {
      const { searchParams } = new URL(request.url);
      const filename = searchParams.get("filename") || "file";
      ext = path.extname(filename) || searchParams.get("ext") || ".bin";
      if (!ext.startsWith(".")) ext = "." + ext;
      originalFilename = filename;
      
      const arrayBuffer = await request.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    if (buffer.length === 0) {
      return NextResponse.json(
        { success: false, error: "Empty file" },
        { status: 400 }
      );
    }

    const randomCode = generateRandomCode(8);
    const timestamp = Date.now();
    const safeFilename = originalFilename.replace(/[^a-zA-Z0-9.-]/g, "_");
    
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const randomFilePath = path.join(uploadDir, `${randomCode}${ext}`);
    const namedFilePath = path.join(uploadDir, `${timestamp}-${safeFilename}`);
    
    await writeFile(randomFilePath, buffer);
    await writeFile(namedFilePath, buffer);

    const baseUrl = request.headers.get("host") || "localhost:3000";
    const protocol = baseUrl.includes("localhost") ? "http" : "https";

    return NextResponse.json({
      success: true,
      result: {
        randomUrl: `${protocol}://${baseUrl}/uploads/${randomCode}${ext}`,
        namedUrl: `${protocol}://${baseUrl}/uploads/${timestamp}-${safeFilename}`,
        filename: originalFilename,
        size: buffer.length,
        contentType: getContentType(ext),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to upload file",
      },
      { status: 500 }
    );
  }
}
