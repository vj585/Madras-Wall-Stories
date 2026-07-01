import { NextResponse } from 'next/server';
import { calculateShippingFee } from '@/utils/shippingUtils';

export async function POST(request) {
  try {
    const { cartTotal } = await request.json();

    if (cartTotal === undefined) {
      return NextResponse.json({ success: false, error: 'Cart total is required' }, { status: 400 });
    }

    const standardFee = calculateShippingFee(cartTotal);

    const response = {
      success: true,
      standard: {
        available: true,
        fee: standardFee,
        partner: 'Standard',
        estimatedDays: '3-5 Business Days'
      }
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error("Shipping calculate API Error:", error);
    return NextResponse.json({ success: false, error: 'Failed to calculate shipping' }, { status: 500 });
  }
}
