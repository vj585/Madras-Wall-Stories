import { NextResponse } from 'next/server';
import razorpay from '@/lib/razorpay';

export async function POST(request) {
  try {
    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid amount' }, { status: 400 });
    }

    // Razorpay amount is in paise (₹1 = 100 paise)
    const options = {
      amount: amount * 100, 
      currency: "INR",
      receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    };

    const order = await razorpay.orders.create(options);
    console.log("Create order payload successful:", order.id);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    }, { status: 200 });

  } catch (error) {
    console.error("Razorpay Order Creation Error details:", error);
    return NextResponse.json({ success: false, error: 'Payment initialization failed.' }, { status: 500 });
  }
}
