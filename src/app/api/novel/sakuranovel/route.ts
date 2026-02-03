import { sakuranovel } from "@/lib/sakuranovel";
import { apiResponse, apiError } from "@/lib/apiResponse";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const query = searchParams.get("q") || "";
  const url = searchParams.get("url") || "";

  try {
    switch (action) {
      case "search": {
        if (!query) {
          return apiError("Query parameter 'q' is required", 400);
        }

        const data = await sakuranovel.search(query);
        return apiResponse({ success: true, data });
      }

      case "detail": {
        if (!url) {
          return apiError("URL parameter 'url' is required. Format: https://sakuranovel.id/series/[series-slug]/", 400);
        }

        const data = await sakuranovel.detail(url);
        return apiResponse({ success: true, data });
      }

      case "chapter": {
        if (!url) {
          return apiError("URL parameter 'url' is required. Format: https://sakuranovel.id/[chapter-slug]/", 400);
        }

        const data = await sakuranovel.chapter(url);
        return apiResponse({ success: true, data });
      }

      default:
        return apiError("Invalid action. Available actions: search, detail, chapter", 400);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return apiError(message, 500);
  }
}
