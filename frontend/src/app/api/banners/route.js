import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Banner from '@/models/Banner';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    // Admin fetches all, storefront only gets Active banners
    const query = all ? {} : { $or: [{ status: 'Active' }, { active: true }] };
    const banners = await Banner.find(query).sort({ order: 1, createdAt: -1 });
    return NextResponse.json({ success: true, data: banners }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body.image) {
      return NextResponse.json({ success: false, error: 'Missing required field: image' }, { status: 400 });
    }

    const newBanner = await Banner.create(body);
    return NextResponse.json({ success: true, data: newBanner }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
