import { apiResponse, apiError } from "@/lib/apiResponse";
import { getSpotifyMetadata } from "@/lib/scrapers/spotify";

function detectType(input: string) {
  if (/open\.spotify\.com\/playlist\//i.test(input)) return "playlist";
  if (/open\.spotify\.com\/track\//i.test(input)) return "track";
  if (/open\.spotify\.com\/album\//i.test(input)) return "album";
  return "search";
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('url');
    
    if (!query) {
      return apiError('Query parameter (q or url) is required', 400);
    }

    const type = detectType(query);
    const songs = await getSpotifyMetadata(query);
    
    if (songs.length === 0) {
      return apiError('No results found', 404);
    }

    return apiResponse({
      success: true,
      type,
      songs,
      metadata: songs[0],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to search';
    return apiError(message, 500);
  }
}
