import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { DonationSubmission } from '@/lib/models/Donation';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const submissions = await DonationSubmission.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch submissions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    const submission = await DonationSubmission.create({
      name: body.name,
      paymentMethod: body.paymentMethod,
      nominal: body.nominal,
      screenshot: body.screenshot,
      message: body.message || '',
      status: 'pending',
    });
    
    return NextResponse.json({ success: true, data: submission });
  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit donation' }, { status: 500 });
  }
}
