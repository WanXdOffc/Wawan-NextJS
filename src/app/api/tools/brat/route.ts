import { NextResponse, NextRequest } from 'next/server';
import { generateBrat } from '@/lib/scrapers/brat';
import { apiResponse, apiError } from '@/lib/apiResponse';
import { checkRateLimit } from '@/lib/rateLimit';

export async function GET(request: NextRequest) {
  const ipAddress = request.headers.get("x-forwarded-for")?.split(',')[0] || request.ip || "127.0.0.1";

  // Check Rate Limit
  const rateLimit = await checkRateLimit(ipAddress, "tool-brat");
  if (!rateLimit.allowed) {
    return apiError(`Terlalu banyak request. Silakan tunggu ${rateLimit.waitSeconds} detik lagi.`, 429);
  }

  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text');
  const animated = searchParams.get('animated') === 'true';
  const delay = parseInt(searchParams.get('delay') || '500');
  const format = searchParams.get('format') || 'image';

  if (!text) {
    return apiError('Parameter text wajib diisi', 400);
  }

  try {
    const data = await generateBrat(text, animated, delay);

    if (format === 'json') {
      return apiResponse({
        success: true,
        data: {
          type: data.type,
          url: data.url,
          base64: data.buffer.toString('base64'),
        },
      });
    }

    return new NextResponse(data.buffer, {
      headers: {
        'Content-Type': animated ? 'image/gif' : 'image/png',
        'Content-Disposition': `inline; filename="brat.${data.type}"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return apiError(message, 500);
  }
}
