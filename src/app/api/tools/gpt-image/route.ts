import { NextResponse } from 'next/server';

const GHIBLI_HEADERS = {
  origin: 'https://overchat.ai',
  referer: 'https://overchat.ai/',
  'user-agent': 'Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36',
  'Content-Type': 'application/json',
};

async function fetchImageAsBase64(url: string): Promise<{ base64: string; mimeType: string }> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch image from URL');
  }
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const contentType = response.headers.get('content-type') || 'image/png';
  return { base64, mimeType: contentType };
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    let base64Image: string;
    let mimeType: string;
    let prompt: string | null = null;

    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { imageUrl, prompt: jsonPrompt } = body as { imageUrl?: string; prompt?: string };

      if (!imageUrl) {
        return NextResponse.json(
          { success: false, error: 'imageUrl is required' },
          { status: 400 }
        );
      }

      if (!jsonPrompt) {
        return NextResponse.json(
          { success: false, error: 'prompt is required' },
          { status: 400 }
        );
      }

      const imageData = await fetchImageAsBase64(imageUrl);
      base64Image = imageData.base64;
      mimeType = imageData.mimeType;
      prompt = jsonPrompt;
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const image = formData.get('image') as File | null;
      prompt = formData.get('prompt') as string | null;

      if (!image) {
        return NextResponse.json(
          { success: false, error: 'Image is required' },
          { status: 400 }
        );
      }

      if (!prompt) {
        return NextResponse.json(
          { success: false, error: 'Prompt is required' },
          { status: 400 }
        );
      }

      const arrayBuffer = await image.arrayBuffer();
      base64Image = Buffer.from(arrayBuffer).toString('base64');
      mimeType = image.type || 'image/png';
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid content type. Use application/json with imageUrl or multipart/form-data with image file' },
        { status: 400 }
      );
    }

    const res = await fetch('https://ghibli-proxy.netlify.app/.netlify/functions/ghibli-proxy', {
      method: 'POST',
      headers: GHIBLI_HEADERS,
      body: JSON.stringify({
        image: `data:${mimeType};base64,${base64Image}`,
        prompt: prompt,
        model: 'gpt-image-1',
        n: 1,
        size: 'auto',
        quality: 'low',
      }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to process image' },
        { status: 500 }
      );
    }

    const data = await res.json();
    const result = data?.data?.[0]?.b64_json;

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'No result from AI' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      image: result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to process image';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
