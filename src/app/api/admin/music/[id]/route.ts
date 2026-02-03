import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Music from '@/lib/models/Music';
import { logActivity } from '@/lib/logActivity';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const music = await Music.findById(id);
    
    if (!music) {
      return NextResponse.json({ success: false, error: 'Music not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, music });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch music';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const body = await request.json();
    
    const music = await Music.findByIdAndUpdate(id, body, { new: true });
    
    if (!music) {
      return NextResponse.json({ success: false, error: 'Music not found' }, { status: 404 });
    }
    
    await logActivity({
      action: 'update',
      entityType: 'music',
      entityId: id,
      entityName: `${music.title} - ${music.artist}`,
    });
    
    return NextResponse.json({ success: true, music });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update music';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const music = await Music.findByIdAndDelete(id);
    
    if (!music) {
      return NextResponse.json({ success: false, error: 'Music not found' }, { status: 404 });
    }
    
    await logActivity({
      action: 'delete',
      entityType: 'music',
      entityId: id,
      entityName: `${music.title} - ${music.artist}`,
    });
    
    return NextResponse.json({ success: true, message: 'Music deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete music';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
