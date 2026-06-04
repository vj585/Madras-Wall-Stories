import { NextResponse } from 'next/server';
import razorpay from '@/lib/razorpay';
import { calculateSecureOrderTotal } from '@/lib/serverPricing';
import { calculateShippingFee } from '@/utils/shippingUtils';
import { connectDB } from '@/lib/mongodb';

export async function POST(request) {
  try {
    const { amount, products } = await request.json();

    if (!amount || amount <= 0 || !products || !products.length) {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }

    await connectDB();

    // 1. Calculate secure subtotal from DB
    const { subtotal } = await calculateSecureOrderTotal(products);
    
    // 2. Calculate secure shipping
    const shipping = calculateShippingFee(subtotal);
    
    // 3. Compute true grand total
    const grandTotal = subtotal + shipping;

    // 4. Reject mismatch (Tamper protection)
    if (grandTotal !== amount) {
      console.error(`Price mismatch detected! Frontend sent: ${amount}, Backend computed: ${grandTotal}`);
      return NextResponse.json({ success: false, error: 'Price mismatch detected. Please refresh the page.' }, { status: 400 });
    }

    // 5. Razorpay amount is in paise (₹1 = 100 paise)
    const options = {
      amount: grandTotal * 100, 
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
