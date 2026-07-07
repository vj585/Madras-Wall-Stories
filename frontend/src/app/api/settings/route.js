import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/mongodb";
import StoreSettings from "@/models/StoreSettings";

export async function GET() {
  try {
    await connectDB();
    const settings = await StoreSettings.findOne({ singletonId: 'global_settings' }).lean();
    
    // Return only public data needed by the frontend components
    return NextResponse.json({ 
      success: true, 
      data: {
        marqueeItems: settings?.marqueeItems || []
      } 
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
  }
}
