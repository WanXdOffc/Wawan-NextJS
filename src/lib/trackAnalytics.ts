import { connectDB } from '@/lib/mongodb';
import { Analytics } from '@/lib/models/Analytics';

interface TrackApiParams {
  path: string;
  method?: string;
  statusCode?: number;
  ip?: string;
  userAgent?: string;
  referer?: string;
  responseTime?: number;
}

export async function trackApiRequest(params: TrackApiParams) {
  try {
    await connectDB();
    await Analytics.create({
      type: 'api_request',
      path: params.path,
      method: params.method || 'GET',
      statusCode: params.statusCode || 200,
      ip: params.ip || 'unknown',
      userAgent: params.userAgent || '',
      referer: params.referer || '',
      responseTime: params.responseTime,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to track API request:', error);
  }
}

export async function trackPageView(params: TrackApiParams) {
  try {
    await connectDB();
    await Analytics.create({
      type: 'page_view',
      path: params.path,
      ip: params.ip || 'unknown',
      userAgent: params.userAgent || '',
      referer: params.referer || '',
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
}
