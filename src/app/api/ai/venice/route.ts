import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body as { message?: string };

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      );
    }

    const res = await fetch("https://outerface.venice.ai/api/inference/chat", {
      method: "POST",
      headers: {
        accept: "*/*",
        "content-type": "application/json",
        origin: "https://venice.ai",
        referer: "https://venice.ai/",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent":
          "Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0",
        "x-venice-version": "interface@20250523.214528+393d253",
      },
      body: JSON.stringify({
        requestId: "nekorinn",
        modelId: "dolphin-3.0-mistral-24b",
        prompt: [
          {
            content: message,
            role: "user",
          },
        ],
        systemPrompt: "",
        conversationType: "text",
        temperature: 0.8,
        webEnabled: true,
        topP: 0.9,
        isCharacter: false,
        clientProcessingTime: 15,
      }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch from Venice AI" },
        { status: 500 }
      );
    }

    const data = await res.text();
    const chunks = data
      .split("\n")
      .filter((chunk) => chunk)
      .map((chunk) => JSON.parse(chunk));
    const result = chunks.map((chunk) => chunk.content).join("");

    if (!result) {
      return NextResponse.json(
        { success: false, error: "No response from Venice AI" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      text: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
