import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { DonationSettings, DonationSubmission } from '@/lib/models/Donation';

export async function GET() {
  try {
    await connectDB();
    let settings = await DonationSettings.findOne();
    if (!settings) {
      settings = await DonationSettings.create({
        paymentMethods: [],
        thankYouMessage: 'Terima kasih atas dukungannya!',
      });
    }
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error fetching donation settings:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    let settings = await DonationSettings.findOne();
    if (!settings) {
      settings = await DonationSettings.create(body);
    } else {
      settings = await DonationSettings.findOneAndUpdate({}, body, { new: true });
    }
    
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error updating donation settings:', error);
    return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 });
  }
}
