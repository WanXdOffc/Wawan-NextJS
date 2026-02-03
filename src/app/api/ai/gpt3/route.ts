import { scrapeGpt3 } from '@/lib/scrapers/gpt3';
import { apiResponse, apiError } from '@/lib/apiResponse';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const prompt = searchParams.get('prompt') || searchParams.get('q');
  const system = searchParams.get('system') || 'You are a helpful assistant';

  if (!prompt) {
    return apiError('Parameter prompt wajib diisi', 400);
  }

  try {
    const messages = [
      { role: 'system' as const, content: system },
      { role: 'user' as const, content: prompt },
    ];
    const data = await scrapeGpt3(messages);
    return apiResponse({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return apiError(message, 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, prompt, system } = body;

    if (messages && Array.isArray(messages)) {
      const data = await scrapeGpt3(messages);
      return apiResponse({ success: true, data });
    }

    if (!prompt) {
      return apiError('Parameter prompt atau messages wajib diisi', 400);
    }

    const msgs = [
      { role: 'system' as const, content: system || 'You are a helpful assistant' },
      { role: 'user' as const, content: prompt },
    ];
    const data = await scrapeGpt3(msgs);
    return apiResponse({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return apiError(message, 500);
  }
}
