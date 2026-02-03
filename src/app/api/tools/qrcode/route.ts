import { NextResponse } from 'next/server';
import { text2qr } from '@/lib/scrapers/qrcode';
import { apiError } from '@/lib/apiResponse';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text');

  if (!text) {
    return apiError('Parameter text wajib diisi', 400);
  }

  try {
    const buffer = await text2qr(text);
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `inline; filename="qrcode.png"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return apiError(message, 500);
  }
}
