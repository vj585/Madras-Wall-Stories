import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import StoreSettings from "@/models/StoreSettings";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role?.toUpperCase() !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    let settings = await StoreSettings.findOne({ singletonId: 'global_settings' });
    
    // If it doesn't exist, create it with defaults
    if (!settings) {
      settings = await StoreSettings.create({
        singletonId: 'global_settings',
        framePricing: [
          { name: 'Black', markup: 0 },
          { name: 'White', markup: 0 },
          { name: 'Wood', markup: 0 },
          { name: 'No Frame', markup: 0 }
        ]
      });
    }

    return NextResponse.json({ success: true, data: settings }, { status: 200 });

  } catch (error) {
    console.error("Settings API GET Error:", error);
    return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role?.toUpperCase() !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { framePricing } = body;

    await connectDB();

    let settings = await StoreSettings.findOne({ singletonId: 'global_settings' });
    
    if (!settings) {
      settings = new StoreSettings({ singletonId: 'global_settings' });
    }

    if (framePricing && Array.isArray(framePricing)) {
      settings.framePricing = framePricing;
    }

    await settings.save();

    return NextResponse.json({ success: true, data: settings }, { status: 200 });

  } catch (error) {
    console.error("Settings API PUT Error:", error);
    return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 });
  }
}
