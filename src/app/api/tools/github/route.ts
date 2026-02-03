import { githubStalk } from '@/lib/scrapers/githubStalk';
import { githubDownload } from '@/lib/scrapers/githubDownloader';
import { apiResponse, apiError } from '@/lib/apiResponse';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const username = searchParams.get('username') || searchParams.get('user');
  const url = searchParams.get('url');

  try {
    switch (action) {
      case 'stalk': {
        if (!username) {
          return apiError('Parameter username wajib diisi', 400);
        }
        const data = await githubStalk(username);
        return apiResponse({ success: true, data });
      }

      case 'download': {
        if (!url) {
          return apiError('Parameter url wajib diisi', 400);
        }
        const data = await githubDownload(url);
        return apiResponse({ success: true, data });
      }

      default:
        return apiError('Invalid action. Available: stalk, download', 400);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return apiError(message, 500);
  }
}
