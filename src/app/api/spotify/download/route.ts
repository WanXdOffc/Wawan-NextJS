import { apiResponse, apiError } from "@/lib/apiResponse";
import { uploadBuffer } from "@/lib/uploader";
import { downloadSpotifyBuffer, getSpotifyMetadata, getSpotifyPlayerSource } from "@/lib/scrapers/spotify";
import { connectDB } from "@/lib/mongodb";
import { Upload } from "@/lib/models/Upload";
import crypto from "crypto";
import { redirect } from "next/navigation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, mode = 'player' } = body;
    
    if (!url) {
      return apiError('URL is required', 400);
    }

    if (mode === 'player') {
      const result = await getSpotifyPlayerSource(url);
      return apiResponse({
        success: true,
        ...result
      });
    }

    // Downloader mode with MongoDB integration
    await connectDB();
    
    // Check if we already have this URL in our DB to avoid redundant uploads
    // (Optional: but good for performance)
    const existing = await Upload.findOne({ path: { $regex: encodeURIComponent(url) } });
    if (existing) {
        return apiResponse({
            success: true,
            download: existing.path,
            filename: existing.filename,
            shortId: existing.shortId,
        });
    }

    const metadata = await getSpotifyMetadata(url);
    const song = metadata[0];
    const originalName = song ? `${song.title} - ${song.artist}.mp3` : 'track.mp3';
    const safeFilename = originalName.replace(/[/\\?%*:|"<>]/g, '-');
    
    const buffer = await downloadSpotifyBuffer(url);
    const baseUrl = request.headers.get("host") || "localhost:3000";
    const uploaded = await uploadBuffer(buffer, ".mp3", baseUrl, safeFilename);

    const shortId = crypto.randomBytes(4).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await Upload.create({
      shortId,
      filename: uploaded.filename,
      originalName: originalName,
      mimeType: "audio/mpeg",
      size: buffer.length,
      path: uploaded.url,
      downloads: 0,
      expiresAt,
    });

    return apiResponse({
      success: true,
      download: uploaded.url,
      filename: uploaded.filename,
      shortId,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to process track';
    console.error('API Error:', error);
    return apiError(message, 500);
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const mode = searchParams.get('mode') || 'download';
    const isRedirect = searchParams.get('redirect') === 'true';
    
    if (!url) {
      return apiError('URL parameter is required', 400);
    }

    if (mode === 'player') {
      const result = await getSpotifyPlayerSource(url);
      return apiResponse({
        success: true,
        ...result
      });
    }

    await connectDB();
    
    // Check if already exists
    let upload = await Upload.findOne({ 
        $or: [
            { path: { $regex: encodeURIComponent(url) } },
            { originalName: { $regex: url } }
        ]
    });

    if (!upload) {
        const metadata = await getSpotifyMetadata(url);
        const song = metadata[0];
        const originalName = song ? `${song.title} - ${song.artist}.mp3` : 'track.mp3';
        const safeFilename = originalName.replace(/[/\\?%*:|"<>]/g, '-');

        const buffer = await downloadSpotifyBuffer(url);
        const baseUrl = request.headers.get("host") || "localhost:3000";
        const uploaded = await uploadBuffer(buffer, ".mp3", baseUrl, safeFilename);

        const shortId = crypto.randomBytes(4).toString("hex");
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        upload = await Upload.create({
            shortId,
            filename: uploaded.filename,
            originalName: originalName,
            mimeType: "audio/mpeg",
            size: buffer.length,
            path: uploaded.url,
            downloads: 0,
            expiresAt,
        });
    }

    if (isRedirect) {
        const baseUrl = request.headers.get("host") || "localhost:3000";
        const protocol = baseUrl.includes('localhost') ? 'http' : 'https';
        return Response.redirect(`${protocol}://${baseUrl}/dl/${upload.shortId}`);
    }

    return apiResponse({
      success: true,
      download: upload.path,
      filename: upload.filename,
      shortId: upload.shortId,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to process track';
    console.error('API Error:', error);
    return apiError(message, 500);
  }
}
