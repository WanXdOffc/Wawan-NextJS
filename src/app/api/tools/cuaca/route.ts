import { wilayahService } from '@/lib/scrapers/cuaca';
import { apiResponse, apiError } from '@/lib/apiResponse';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'weather';
  const query = searchParams.get('q') || searchParams.get('query');
  const kode = searchParams.get('kode');

  try {
    switch (action) {
      case 'search': {
        if (!query) {
          return apiError('Parameter q wajib diisi', 400);
        }
        const data = await wilayahService.searchWilayah(query);
        return apiResponse({ success: true, data });
      }

      case 'weather': {
        if (!query && !kode) {
          return apiError('Parameter q atau kode wajib diisi', 400);
        }

        if (kode) {
          const data = await wilayahService.getWeatherData(kode);
          return apiResponse({ success: true, data });
        }

        const data = await wilayahService.scrape(query!);
        if (!data) {
          return apiError('Wilayah tidak ditemukan', 404);
        }
        return apiResponse({ success: true, data });
      }

      default:
        return apiError('Invalid action. Available: search, weather', 400);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return apiError(message, 500);
  }
}
