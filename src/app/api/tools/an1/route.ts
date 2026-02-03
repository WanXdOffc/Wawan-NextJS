import { an1Search } from '@/lib/scrapers/an1';
import { apiResponse, apiError } from '@/lib/apiResponse';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || searchParams.get('query');

  if (!query) {
    return apiError('Parameter q wajib diisi', 400);
  }

  try {
    const data = await an1Search(query);
    return apiResponse({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return apiError(message, 500);
  }
}
