import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/mongodb";
import StoreSettings from "@/models/StoreSettings";

export async function POST(request) {
  try {
    const { cartTotal } = await request.json();

    if (cartTotal === undefined) {
      return NextResponse.json({ success: false, error: 'Cart total is required' }, { status: 400 });
    }

    await connectDB();
    const settings = await StoreSettings.findOne({ singletonId: 'global_settings' });
    
    // Strict Rules: Cart < 299 -> 39, >= 299 -> Free
    const threshold = settings?.freeShippingThreshold ?? 299;
    const fee = settings?.lowCartDeliveryFee ?? 39;
    
    let standardFee = (cartTotal < threshold) ? fee : 0;

    const response = {
      success: true,
      standard: {
        available: true,
        fee: standardFee,
        partner: settings?.deliveryProvider || 'Shiprocket',
        estimatedDays: '3-5 Business Days'
      }
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error("Shipping calculate API Error:", error);
    return NextResponse.json({ success: false, error: 'Failed to calculate shipping' }, { status: 500 });
  }
}
