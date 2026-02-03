import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Analytics } from '@/lib/models/Analytics';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { events } = body;
    
    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ success: false, error: 'No events' }, { status: 400 });
    }
    
    await Analytics.insertMany(events);
    
    return NextResponse.json({ success: true, count: events.length });
  } catch (error) {
    console.error('Analytics track error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
