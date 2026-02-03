import { getCourierList, trackResi, searchCourier } from '@/lib/scrapers/resi';
import { apiResponse, apiError } from '@/lib/apiResponse';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'track';
  const resi = searchParams.get('resi');
  const courier = searchParams.get('courier');
  const keyword = searchParams.get('q') || searchParams.get('keyword');

  try {
    switch (action) {
      case 'couriers': {
        const data = await getCourierList();
        return apiResponse({ success: true, data: data.map((c: { name: string }) => c.name) });
      }

      case 'search': {
        if (!keyword) {
          return apiError('Parameter q wajib diisi', 400);
        }
        const data = await searchCourier(keyword);
        return apiResponse({ success: true, data });
      }

      case 'track': {
        if (!resi) {
          return apiError('Parameter resi wajib diisi', 400);
        }
        if (!courier) {
          return apiError('Parameter courier wajib diisi', 400);
        }
        const data = await trackResi(resi, courier);
        return apiResponse({ success: true, data });
      }

      default:
        return apiError('Invalid action. Available: couriers, search, track', 400);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return apiError(message, 500);
  }
}
