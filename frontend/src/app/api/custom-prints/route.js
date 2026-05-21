import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import CustomPrint from '@/models/CustomPrint';

export async function GET() {
  try {
    await connectDB();
    const customPrints = await CustomPrint.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: customPrints }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const requiredFields = ['uploadedImage', 'size', 'customerName', 'phone'];
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return NextResponse.json({ success: false, error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    const newCustomPrint = await CustomPrint.create(body);
    return NextResponse.json({ success: true, data: newCustomPrint }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
