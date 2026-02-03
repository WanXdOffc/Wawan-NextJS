import crypto from "crypto";
import axios from "axios";
import { apiResponse, apiError } from "@/lib/apiResponse";

const SAVETUBE_KEY = "C5D58EF67A7584E4A29F6C35BBC4EB12";
const FORMATS = ["144", "240", "360", "480", "720", "1080", "mp3"];
const YOUTUBE_REGEX = /^((?:https?:)?\/\/)?((?:www|m|music)\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(?:embed\/)?(?:v\/)?(?:shorts\/)?([a-zA-Z0-9_-]{11})/;

const api = axios.create({
  headers: {
    "content-type": "application/json",
    "origin": "https://yt.savetube.me",
    "user-agent": "Mozilla/5.0 (Android 15; Mobile; SM-F958; rv:130.0) Gecko/130.0 Firefox/130.0",
  },
});

async function decrypt(enc: string) {
  const sr = Buffer.from(enc, "base64");
  const ky = Buffer.from(SAVETUBE_KEY, "hex");
  const iv = sr.slice(0, 16);
  const dt = sr.slice(16);
  const dc = crypto.createDecipheriv("aes-128-cbc", ky, iv);
  return JSON.parse(Buffer.concat([dc.update(dt), dc.final()]).toString());
}

async function getCdn() {
  const response = await api.get("https://media.savetube.vip/api/random-cdn");
  return response.data.cdn;
}

async function download(url: string, format: string = "mp3") {
  const match = url.match(YOUTUBE_REGEX);
  const id = match?.[3];

  if (!id) {
    return { success: false, error: "Invalid YouTube URL" };
  }

  if (!FORMATS.includes(format)) {
    return { success: false, error: "Invalid format", availableFormats: FORMATS };
  }

  const cdn = await getCdn();
  const res = await api.post(`https://${cdn}/v2/info`, {
    url: `https://www.youtube.com/watch?v=${id}`,
  });

  const dec = await decrypt(res.data.data);
  const dl = await api.post(`https://${cdn}/download`, {
    id: id,
    downloadType: format === "mp3" ? "audio" : "video",
    quality: format === "mp3" ? "128" : format,
    key: dec.key,
  });

  return {
    success: true,
    data: {
      title: dec.title,
      format: format,
      thumbnail: dec.thumbnail || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      duration: dec.duration,
      cached: dec.fromCache,
      downloadUrl: dl.data.data.downloadUrl,
    },
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const format = searchParams.get("format") || "mp3";

  if (!url) {
    return apiError("URL parameter is required", 400);
  }

  try {
    const result = await download(url, format);
    if (!result.success) {
      return apiError(result.error || "Download failed", 400);
    }
    return apiResponse(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return apiError(message, 500);
  }
}
