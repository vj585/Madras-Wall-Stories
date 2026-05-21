import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Banner from '@/models/Banner';

export async function GET() {
  try {
    await connectDB();
    const banners = await Banner.find({}).sort({ order: 1, createdAt: -1 });
    return NextResponse.json({ success: true, data: banners }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const requiredFields = ['image'];
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return NextResponse.json({ success: false, error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    const newBanner = await Banner.create(body);
    return NextResponse.json({ success: true, data: newBanner }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
