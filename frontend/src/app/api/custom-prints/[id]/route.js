import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import CustomPrint from '@/models/CustomPrint';
import mongoose from 'mongoose';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid CustomPrint ID format' }, { status: 400 });
    }

    await connectDB();
    const customPrint = await CustomPrint.findById(id);

    if (!customPrint) {
      return NextResponse.json({ success: false, error: 'CustomPrint not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: customPrint }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid CustomPrint ID format' }, { status: 400 });
    }

    await connectDB();
    const body = await request.json();

    const customPrint = await CustomPrint.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!customPrint) {
      return NextResponse.json({ success: false, error: 'CustomPrint not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: customPrint }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid CustomPrint ID format' }, { status: 400 });
    }

    await connectDB();
    const customPrint = await CustomPrint.findByIdAndDelete(id);

    if (!customPrint) {
      return NextResponse.json({ success: false, error: 'CustomPrint not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
