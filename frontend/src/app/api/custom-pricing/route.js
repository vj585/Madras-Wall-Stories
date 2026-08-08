import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import CustomPricing from '@/models/CustomPricing';

export async function GET() {
  try {
    await connectDB();
    // We only need one settings document. Find the first one.
    let pricing = await CustomPricing.findOne({});
    
    // If it doesn't exist yet, create the default one.
    if (!pricing) {
      pricing = await CustomPricing.create({});
    }
    
    return NextResponse.json({ success: true, data: pricing }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Find the first document
    let pricing = await CustomPricing.findOne({});
    
    if (!pricing) {
      pricing = await CustomPricing.create(body);
    } else {
      // Update it
      pricing.basePrices = body.basePrices || pricing.basePrices;
      pricing.sizes = body.sizes || pricing.sizes;
      pricing.frames = body.frames || pricing.frames;
      pricing.finishes = body.finishes || pricing.finishes;
      await pricing.save();
    }

    return NextResponse.json({ success: true, data: pricing }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

