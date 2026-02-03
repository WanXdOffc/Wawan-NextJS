import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Music from '@/lib/models/Music';
import { logActivity } from '@/lib/logActivity';

export async function GET() {
  try {
    await connectDB();
    const musicList = await Music.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, music: musicList });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch music';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    
    const { title, artist, spotifyUrl, coverImage, duration } = body;
    
    if (!title || !artist || !spotifyUrl) {
      return NextResponse.json(
        { success: false, error: 'Title, artist, and spotifyUrl are required' },
        { status: 400 }
      );
    }

    const music = new Music({
      title,
      artist,
      spotifyUrl,
      coverImage: coverImage || '',
      duration: duration || '',
      active: true,
    });

    await music.save();
    
    await logActivity({
      action: 'create',
      entityType: 'music',
      entityId: music._id.toString(),
      entityName: `${title} - ${artist}`,
    });
    
    return NextResponse.json({ success: true, music });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create music';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
