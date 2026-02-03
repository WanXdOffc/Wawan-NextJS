import axios from "axios";
import * as cheerio from "cheerio";
import { XMLParser } from "fast-xml-parser";
import { apiResponse, apiError } from "@/lib/apiResponse";

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "cache-control": "max-age=0",
  "dpr": "2",
  "viewport-width": "980",
  "sec-ch-ua": '"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"',
  "sec-ch-ua-mobile": "?1",
  "sec-ch-ua-platform": '"Android"',
  "sec-fetch-site": "same-origin",
  "sec-fetch-mode": "navigate",
  "sec-fetch-dest": "document",
  "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
};

interface VideoTrack {
  url: string;
  bandwidth: number;
  codecs: string;
  mimeType: string;
  resolution: string;
  qualityLabel: string;
}

interface AudioTrack {
  url: string;
  bandwidth: number;
  codecs: string;
  mimeType: string;
}

async function downloadInstagram(url: string) {
  const response = await axios.get(url, {
    headers: HEADERS,
    timeout: 10000,
  });

  const $ = cheerio.load(response.data);
  let scriptJson: any = null;

  $('script[type="application/json"]').each((_, el) => {
    const content = $(el).html();
    if (content && content.includes("xdt_api__v1__media__shortcode__web_info")) {
      try {
        scriptJson = JSON.parse(content);
      } catch {
        // ignore parse error
      }
    }
  });

  if (!scriptJson) {
    throw new Error("Data not found (IP may be blocked or invalid URL)");
  }

  const item = scriptJson.require?.[0]?.[3]?.[0]?.__bbox?.require?.[0]?.[3]?.[1]?.__bbox?.result?.data?.xdt_api__v1__media__shortcode__web_info?.items?.[0];

  if (!item) {
    throw new Error("Media item not found in response");
  }

  const dashXml = item.video_dash_manifest;
  if (!dashXml) {
    throw new Error("DASH manifest not found");
  }

  const parser = new XMLParser({ ignoreAttributes: false });
  const manifest = parser.parse(dashXml);

  const period = manifest.MPD?.Period;
  if (!period) {
    throw new Error("Period tag not found in manifest");
  }

  const adaptationSets = Array.isArray(period.AdaptationSet) ? period.AdaptationSet : [period.AdaptationSet];
  const videoTracks: VideoTrack[] = [];
  const audioTracks: AudioTrack[] = [];

  adaptationSets.forEach((set: any) => {
    if (!set) return;

    const isVideo = set["@_contentType"] === "video";
    const isAudio = set["@_contentType"] === "audio";
    const representations = Array.isArray(set.Representation) ? set.Representation : [set.Representation];

    representations.forEach((rep: any) => {
      if (!rep) return;

      const track = {
        url: rep.BaseURL,
        bandwidth: parseInt(rep["@_bandwidth"]) || 0,
        codecs: rep["@_codecs"] || "",
        mimeType: rep["@_mimeType"] || "",
      };

      if (isVideo) {
        videoTracks.push({
          ...track,
          resolution: `${rep["@_width"]}x${rep["@_height"]}`,
          qualityLabel: rep["@_FBQualityLabel"] || "",
        });
      } else if (isAudio) {
        audioTracks.push(track);
      }
    });
  });

  videoTracks.sort((a, b) => b.bandwidth - a.bandwidth);

  return {
    metadata: {
      id: item.id,
      code: item.code,
      caption: item.caption?.text || "",
      createTime: new Date(item.taken_at * 1000).toISOString(),
    },
    author: {
      id: item.user?.pk,
      username: item.user?.username || "N/A",
      fullName: item.user?.full_name || "",
      profilePic: item.user?.hd_profile_pic_url_info?.url || "",
      verified: item.user?.is_verified,
    },
    media: {
      thumbnails: (item.image_versions2?.candidates || []).map((img: any) => ({
        url: img.url,
        resolution: `${img.width}x${img.height}`,
      })),
      videos: videoTracks,
      audios: audioTracks,
    },
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return apiError("URL parameter is required", 400);
  }

  if (!url.includes("instagram.com")) {
    return apiError("Invalid Instagram URL", 400);
  }

  try {
    const result = await downloadInstagram(url);
    return apiResponse({ success: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return apiError(message, 500);
  }
}
