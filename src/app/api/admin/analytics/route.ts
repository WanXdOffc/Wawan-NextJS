import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Analytics } from '@/lib/models/Analytics';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '24h';
    
    let startDate: Date;
    const now = new Date();
    
    switch (period) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        const lastMonthData = await getAnalyticsData(startDate, endOfLastMonth, period);
        return NextResponse.json({ success: true, ...lastMonthData });
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
    
    const data = await getAnalyticsData(startDate, now, period);
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

async function getAnalyticsData(startDate: Date, endDate: Date, period: string) {
  const apiRequests = await Analytics.countDocuments({
    type: 'api_request',
    timestamp: { $gte: startDate, $lte: endDate }
  });
  
  const pageViews = await Analytics.countDocuments({
    type: 'page_view',
    timestamp: { $gte: startDate, $lte: endDate }
  });
  
  const uniqueVisitors = await Analytics.distinct('ip', {
    type: 'page_view',
    timestamp: { $gte: startDate, $lte: endDate }
  });
  
  let groupBy: Record<string, unknown>;
  let sortKey: string;
  
  if (period === '24h') {
    groupBy = { $hour: '$timestamp' };
    sortKey = '_id';
  } else if (period === '7d' || period === '30d') {
    groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } };
    sortKey = '_id';
  } else {
    groupBy = { $dateToString: { format: '%Y-%m', date: '$timestamp' } };
    sortKey = '_id';
  }
  
  const apiRequestsOverTime = await Analytics.aggregate([
    { $match: { type: 'api_request', timestamp: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: groupBy, count: { $sum: 1 } } },
    { $sort: { [sortKey]: 1 } }
  ]);
  
  const pageViewsOverTime = await Analytics.aggregate([
    { $match: { type: 'page_view', timestamp: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: groupBy, count: { $sum: 1 } } },
    { $sort: { [sortKey]: 1 } }
  ]);
  
  const topEndpoints = await Analytics.aggregate([
    { $match: { type: 'api_request', timestamp: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: '$path', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  
  const topPages = await Analytics.aggregate([
    { $match: { type: 'page_view', timestamp: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: '$path', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  
  return {
    summary: {
      apiRequests,
      pageViews,
      uniqueVisitors: uniqueVisitors.length
    },
    charts: {
      apiRequestsOverTime,
      pageViewsOverTime
    },
    topEndpoints,
    topPages,
    period
  };
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { type, path, method, statusCode, responseTime } = body;
    
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || '';
    
    await Analytics.create({
      type,
      path,
      method,
      statusCode,
      ip,
      userAgent,
      referer,
      responseTime,
      timestamp: new Date()
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics track error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
