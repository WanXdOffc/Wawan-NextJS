import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Music from '@/lib/models/Music';

export async function GET() {
  try {
    await connectDB();
    const musicList = await Music.find({ active: true }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, music: musicList });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch music';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
