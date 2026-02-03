import { getInstagramProfile } from '@/lib/scrapers/igStalk';
import { apiResponse, apiError } from '@/lib/apiResponse';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username') || searchParams.get('user');

  if (!username) {
    return apiError('Parameter username wajib diisi', 400);
  }

  try {
    const data = await getInstagramProfile(username);
    return apiResponse({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return apiError(message, 500);
  }
}
