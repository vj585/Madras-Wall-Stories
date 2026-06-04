import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { processAndSaveOrder } from '@/lib/orderUtils';
import { calculateSecureOrderTotal } from '@/lib/serverPricing';
import { calculateShippingFee } from '@/utils/shippingUtils';

export async function POST(request) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderDetails } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Missing payment verification details.' }, { status: 400 });
    }

    console.log("Verify payload received:", { razorpay_order_id, razorpay_payment_id, razorpay_signature });

    // Phase 4: Verify Signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error("Missing RAZORPAY_KEY_SECRET in backend");
      return NextResponse.json({ success: false, error: 'Internal server configuration error.' }, { status: 500 });
    }

    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      console.error("Signature mismatch:", { generated: generated_signature, received: razorpay_signature });
      return NextResponse.json({ success: false, error: 'Invalid payment signature. Payment verification failed.' }, { status: 400 });
    }

    await connectDB();

    // Phase 8: Duplicate Payment Protection
    const existingOrder = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (existingOrder) {
      return NextResponse.json({ success: false, error: 'Order for this payment already exists.' }, { status: 400 });
    }

    // Phase 5 & 6: Immutable Server-Side Pricing Verification
    const { subtotal, recalculatedProducts } = await calculateSecureOrderTotal(orderDetails.products || []);
    const shipping = calculateShippingFee(subtotal);
    const grandTotal = subtotal + shipping;

    const finalOrder = {
      ...orderDetails,
      products: recalculatedProducts,
      subtotal,
      shipping,
      grandTotal,
      amount: grandTotal, // Backwards compatibility
      freeShippingApplied: shipping === 0,
      paymentMethod: 'Razorpay',
      paymentStatus: 'Paid',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      paymentTimestamp: new Date(),
    };

    const newOrder = await processAndSaveOrder(finalOrder);

    return NextResponse.json({ success: true, data: newOrder }, { status: 201 });

  } catch (error) {
    console.error("Payment Verification Error full details:", error);
    // Code 11000 is duplicate key in MongoDB, which handles our unique constraint safety net
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'Order for this payment already exists.' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message || 'Internal server error during verification.' }, { status: 500 });
  }
}
