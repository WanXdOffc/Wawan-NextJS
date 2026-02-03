import axios from "axios";
import crypto from "crypto";
import { apiResponse, apiError } from "@/lib/apiResponse";

const k = {
  enc: "GJvE5RZIxrl9SuNrAtgsvCfWha3M7NGC",
  dec: "H3quWdWoHLX5bZSlyCYAnvDFara25FIu",
};

const cryptoProc = (type: "enc" | "dec", data: string): string => {
  const key = Buffer.from(k[type]);
  const iv = Buffer.from(k[type].slice(0, 16));

  if (type === "enc") {
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let result = cipher.update(data, "utf8", "base64");
    result += cipher.final("base64");
    return result;
  } else {
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let result = decipher.update(data, "base64", "utf8");
    result += decipher.final("utf8");
    return result;
  }
};

interface TikTokResult {
  author: string;
  thumbnail: string;
  video: string;
  audio: string;
}

async function tiktokDl(url: string): Promise<TikTokResult> {
  if (!/tiktok\.com/.test(url)) throw new Error("Invalid TikTok url.");

  const { data } = await axios.post(
    "https://savetik.app/requests",
    {
      bdata: cryptoProc("enc", url),
    },
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Android 16; Mobile; SM-D639N; rv:130.0) Gecko/130.0 Firefox/130.0",
        "Content-Type": "application/json",
      },
    }
  );

  if (!data || data.status !== "success") throw new Error("Fetch failed.");

  return {
    author: data.username,
    thumbnail: data.thumbnailUrl,
    video: cryptoProc("dec", data.data),
    audio: data.mp3,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return apiError("URL parameter is required", 400);
  }

  try {
    const result = await tiktokDl(url);
    return apiResponse({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("TikTok Downloader API error:", error);
    return apiError(
      error instanceof Error ? error.message : "Failed to download TikTok video",
      500
    );
  }
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return apiError("TikTok URL is required", 400);
    }

    const result = await tiktokDl(url);
    return apiResponse({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("TikTok Downloader API error:", error);
    return apiError(
      error instanceof Error ? error.message : "Failed to download TikTok video",
      500
    );
  }
}
