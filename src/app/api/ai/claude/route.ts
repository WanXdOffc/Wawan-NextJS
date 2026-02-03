import { NextResponse } from "next/server";
import axios from "axios";

async function claude3(question: string): Promise<string> {
  if (!question) throw new Error("Question is required.");

  const { data: html, headers } = await axios.get(
    "https://minitoolai.com/Claude-3/"
  );

  const { data: cf } = await axios.post(
    "https://api.nekolabs.web.id/tls/bypass/cf-turnstile",
    {
      url: "https://minitoolai.com/Claude-3/",
      siteKey: "0x4AAAAAABjI2cBIeVpBYEFi",
    }
  );

  if (!cf?.result) throw new Error("Failed to get cf token.");

  const utokenMatch = html.match(/var\s+utoken\s*=\s*"([^"]*)"/);
  const utoken = utokenMatch?.[1];
  if (!utoken) throw new Error("Failed to get utoken.");

  const cookies = headers["set-cookie"]?.join("; ") || "";

  const { data: task } = await axios.post(
    "https://minitoolai.com/Claude-3/claude3_stream.php",
    new URLSearchParams({
      messagebase64img1: "",
      messagebase64img0: "",
      select_model: "claude-3-haiku-20240307",
      temperature: "0.7",
      utoken: utoken,
      message: question,
      umes1a: "",
      bres1a: "",
      umes2a: "",
      bres2a: "",
      cft: encodeURIComponent(cf.result),
    }).toString(),
    {
      headers: {
        accept: "*/*",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        cookie: cookies,
        origin: "https://minitoolai.com",
        referer: "https://minitoolai.com/Claude-3/",
        "sec-ch-ua": '"Chromium";v="137", "Not(A)Brand";v="24"',
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": '"Android"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent":
          "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36",
        "x-requested-with": "XMLHttpRequest",
      },
    }
  );

  const { data } = await axios.get(
    "https://minitoolai.com/Claude-3/claude3_stream.php",
    {
      headers: {
        accept: "*/*",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        cookie: cookies,
        origin: "https://minitoolai.com",
        referer: "https://minitoolai.com/Claude-3/",
        "sec-ch-ua": '"Chromium";v="137", "Not(A)Brand";v="24"',
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": '"Android"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent":
          "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36",
        "x-requested-with": "XMLHttpRequest",
      },
      params: {
        streamtoken: task,
      },
    }
  );

  const result = data
    .split("\n")
    .filter((line: string) => line && line.startsWith("data: {"))
    .map((line: string) => JSON.parse(line.substring(6)))
    .filter((line: { type: string }) => line.type === "content_block_delta")
    .map((line: { delta: { text: string } }) => line.delta.text)
    .join("");

  if (!result) throw new Error("No result found.");

  return result;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text") || searchParams.get("prompt");

  if (!text) {
    return NextResponse.json(
      { success: false, error: "Text parameter is required" },
      { status: 400 }
    );
  }

  try {
    const result = await claude3(text);
    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Claude API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to process request",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { prompt, text } = await request.json();
    const question = prompt || text;

    if (!question) {
      return NextResponse.json(
        { success: false, error: "Prompt is required" },
        { status: 400 }
      );
    }

    const result = await claude3(question);
    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Claude API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to process request",
      },
      { status: 500 }
    );
  }
}
