import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { DonationSubmission } from '@/lib/models/Donation';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    
    const submission = await DonationSubmission.findByIdAndUpdate(
      id,
      { status: body.status },
      { new: true }
    );
    
    if (!submission) {
      return NextResponse.json({ success: false, error: 'Submission not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: submission });
  } catch (error) {
    console.error('Error updating submission:', error);
    return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    
    await DonationSubmission.findByIdAndDelete(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting submission:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
  }
}
