import axios from "axios";
import { apiResponse, apiError } from "@/lib/apiResponse";

const TEMPMAIL_HEADERS = {
  'User-Agent': 'ScRaPe/9.9 (KaliLinux; Nusantara Os; My/Shannz)',
  'Connection': 'Keep-Alive',
  'Accept-Encoding': 'gzip',
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return apiError("Token is required", 400);
    }

      const response = await axios.get(
        `https://tempail.top/api/messages/${token}/ApiTempail`,
        { headers: TEMPMAIL_HEADERS, timeout: 10000 }
      );

      const messages = response.data?.messages || response.data || [];
      
      const formattedMessages = Array.isArray(messages) ? messages.map((msg: Record<string, unknown>) => ({
        ...msg,
        _id: msg.id || msg._id || String(Date.now()),
        date: msg.date || msg.created_at || msg.received_at || msg.timestamp || new Date().toISOString(),
      })) : messages;

      return apiResponse({ success: true, result: formattedMessages });
  } catch (error) {
    console.error("TempMail inbox error:", error);
    return apiError("Failed to fetch inbox", 500);
  }
}
