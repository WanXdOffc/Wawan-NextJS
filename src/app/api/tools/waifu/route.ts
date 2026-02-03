import { NextResponse } from 'next/server';
import { getRandomWaifuImage } from '@/lib/scrapers/waifu';
import { apiResponse, apiError } from '@/lib/apiResponse';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'json';

  try {
    const data = await getRandomWaifuImage();

    if (format === 'image') {
      return new NextResponse(data.buffer, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Content-Disposition': `inline; filename="waifu.jpg"`,
        },
      });
    }

    return apiResponse({
      success: true,
      data: {
        url: data.url,
        base64: data.buffer.toString('base64'),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return apiError(message, 500);
  }
}
