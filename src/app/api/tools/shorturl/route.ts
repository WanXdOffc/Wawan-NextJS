import axios from "axios";
import { apiResponse, apiError } from "@/lib/apiResponse";

async function isgdShorten(url: string): Promise<string> {
  if (!url.includes("https://") && !url.includes("http://")) {
    throw new Error("Invalid url. Must include http:// or https://");
  }

  const { data } = await axios.get(
    `https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`,
    {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36",
      },
    }
  );

  if (!data || !data.startsWith("https://")) {
    throw new Error("Failed to shorten URL");
  }

  return data;
}

async function tinubeShorten(url: string, suffix: string = ""): Promise<string> {
  if (!url.includes("https://") && !url.includes("http://")) {
    throw new Error("Invalid url. Must include http:// or https://");
  }

  const { data } = await axios.post(
    "https://tinu.be/en",
    [
      {
        longUrl: url,
        urlCode: suffix,
      },
    ],
    {
      headers: {
        "next-action": "74b2f223fe2b6e65737e07eeabae72c67abf76b2",
        "next-router-state-tree":
          '%5B%22%22%2C%7B%22children%22%3A%5B%22(site)%22%2C%7B%22children%22%3A%5B%5B%22lang%22%2C%22en%22%2C%22d%22%5D%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%2Ctrue%5D',
        origin: "https://tinu.be",
        referer: "https://tinu.be/en",
        "user-agent":
          "Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36",
      },
    }
  );

  const line = data.split("\n").find((l: string) => l.startsWith("1:"));
  if (!line) throw new Error("Failed to parse response.");

  const parsed = JSON.parse(line.substring(2));
  const result = parsed.data?.urlCode;
  if (!result) throw new Error("No urlCode found or suffix is already in use.");

  return "https://tinu.be/" + result;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const provider = searchParams.get("provider") || "isgd";
  const suffix = searchParams.get("suffix") || "";

  if (!url) {
    return apiError("URL parameter is required", 400);
  }

  try {
    let result: string;

    if (provider === "tinube") {
      result = await tinubeShorten(url, suffix);
    } else {
      result = await isgdShorten(url);
    }

    return apiResponse({
      success: true,
      result,
      originalUrl: url,
      provider,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Short URL API error:", error);
    return apiError(
      error instanceof Error ? error.message : "Failed to create short URL",
      500
    );
  }
}

export async function POST(request: Request) {
  try {
    const { url, provider = "isgd", suffix = "" } = await request.json();

    if (!url) {
      return apiError("URL is required", 400);
    }

    let result: string;

    if (provider === "tinube") {
      result = await tinubeShorten(url, suffix);
    } else {
      result = await isgdShorten(url);
    }

    return apiResponse({
      success: true,
      result,
      originalUrl: url,
      provider,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Short URL API error:", error);
    return apiError(
      error instanceof Error ? error.message : "Failed to create short URL",
      500
    );
  }
}
