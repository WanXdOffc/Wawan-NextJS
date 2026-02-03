import { NextResponse } from "next/server";
import axios from "axios";

interface TikTokDownload {
  type: string;
  label: string;
  url: string;
}

interface TikTokResult {
  title: string;
  author: {
    username: string;
    avatar: string | undefined;
  };
  cover: string | null;
  downloads: TikTokDownload[];
}

async function tikwm(url: string): Promise<TikTokResult> {
  if (!url.includes("tiktok.com")) throw new Error("Invalid TikTok url.");

  const apiUrl = "https://www.tikwm.com/api/";
  
  const { data } = await axios.post(apiUrl, new URLSearchParams({
    url: url,
    count: "12",
    cursor: "0",
    web: "1",
    hd: "1"
  }), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept": "application/json",
    },
  });

  if (data.code !== 0) {
    throw new Error(data.msg || "Failed to fetch video");
  }

  const videoData = data.data;
  const downloads: TikTokDownload[] = [];

  if (videoData.hdplay) {
    downloads.push({
      type: "hd",
      label: "HD Video (No Watermark)",
      url: videoData.hdplay.startsWith("http") ? videoData.hdplay : `https://www.tikwm.com${videoData.hdplay}`
    });
  }

  if (videoData.play) {
    downloads.push({
      type: "nowm",
      label: "Video (No Watermark)",
      url: videoData.play.startsWith("http") ? videoData.play : `https://www.tikwm.com${videoData.play}`
    });
  }

  if (videoData.wmplay) {
    downloads.push({
      type: "wm",
      label: "Video (With Watermark)",
      url: videoData.wmplay.startsWith("http") ? videoData.wmplay : `https://www.tikwm.com${videoData.wmplay}`
    });
  }

  if (videoData.music) {
    downloads.push({
      type: "audio",
      label: "Audio (MP3)",
      url: videoData.music.startsWith("http") ? videoData.music : `https://www.tikwm.com${videoData.music}`
    });
  }

  const coverUrl = videoData.cover || videoData.origin_cover || null;

  return {
    title: videoData.title || "",
    author: {
      username: videoData.author?.unique_id || videoData.author?.nickname || "",
      avatar: videoData.author?.avatar || undefined,
    },
    cover: coverUrl ? (coverUrl.startsWith("http") ? coverUrl : `https://www.tikwm.com${coverUrl}`) : null,
    downloads,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { success: false, error: "URL parameter is required" },
      { status: 400 }
    );
  }

  try {
    const result = await tikwm(url);
    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("TikTok v2 Downloader API error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to download TikTok video",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: "TikTok URL is required" },
        { status: 400 }
      );
    }

    const result = await tikwm(url);
    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("TikTok v2 Downloader API error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to download TikTok video",
      },
      { status: 500 }
    );
  }
}
