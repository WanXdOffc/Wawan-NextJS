import axios from "axios";
import { apiResponse, apiError } from "@/lib/apiResponse";

const API_BASE = "https://air.vunime.my.id/mobinime";
const API_KEY = "ThWmZq4t7w!z%C*F-JaNdRgUkXn2r5u8";

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "accept-encoding": "gzip",
    "content-type": "application/x-www-form-urlencoded; charset=utf-8",
    host: "air.vunime.my.id",
    "user-agent": "Dart/3.3 (dart:io)",
    "x-api-key": API_KEY,
  },
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const type = searchParams.get("type") || "series";
  const page = searchParams.get("page") || "0";
  const count = searchParams.get("count") || "15";
  const genre = searchParams.get("genre") || "";
  const query = searchParams.get("q") || "";
  const id = searchParams.get("id") || "";
  const epsid = searchParams.get("epsid") || "";
  const quality = searchParams.get("quality") || "HD";

  try {
    switch (action) {
      case "homepage": {
        const { data } = await apiClient.get("/pages/homepage");
        return apiResponse({ success: true, data });
      }

      case "list": {
        const types: Record<string, string> = {
          series: "1",
          movie: "3",
          ova: "2",
          "live-action": "4",
        };

        if (!types[type]) {
          return apiError(`Available types: ${Object.keys(types).join(", ")}`, 400);
        }

        const genresRes = await apiClient.get("/anime/genre");
        const genres = genresRes.data;
        let gnr = "";
        
        if (genre) {
          const found = genres.find((g: { title: string; id: string }) => 
            g.title.toLowerCase().replace(/\s+/g, "-") === genre.toLowerCase()
          );
          if (!found) {
            return apiError(`Available genres: ${genres.map((g: { title: string }) => g.title.toLowerCase().replace(/\s+/g, "-")).join(", ")}`, 400);
          }
          gnr = found.id;
        }

        const { data } = await apiClient.post("/anime/list", {
          perpage: count,
          startpage: page,
          userid: "",
          sort: "",
          genre: gnr,
          jenisanime: types[type],
        });

        return apiResponse({ success: true, data });
      }

      case "genres": {
        const { data } = await apiClient.get("/anime/genre");
        return apiResponse({ success: true, data });
      }

      case "search": {
        if (!query) {
          return apiError("Query parameter 'q' is required", 400);
        }

        const { data } = await apiClient.post("/anime/search", {
          perpage: count,
          startpage: page,
          q: query,
        });

        return apiResponse({ success: true, data });
      }

      case "detail": {
        if (!id || isNaN(Number(id))) {
          return apiError("Valid 'id' parameter is required", 400);
        }

        const { data } = await apiClient.post("/anime/detail", { id });
        return apiResponse({ success: true, data });
      }

      case "stream": {
        if (!id || !epsid) {
          return apiError("Both 'id' (anime id) and 'epsid' (episode id) are required", 400);
        }

        const { data: srv } = await apiClient.post("/anime/get-server-list", {
          id: epsid,
          animeId: id,
          jenisAnime: "1",
          userId: "",
        });

        const { data } = await apiClient.post("/anime/get-url-video", {
          url: srv.serverurl,
          quality,
          position: "0",
        });

        if (!data?.url) {
          return apiError("Stream URL not found", 404);
        }

        return apiResponse({ success: true, data: { url: data.url } });
      }

      default:
        return apiError("Invalid action. Available actions: homepage, list, genres, search, detail, stream", 400);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return apiError(message, 500);
  }
}
