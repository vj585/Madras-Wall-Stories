import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import PendingPayment from '@/models/PendingPayment';
import { processAndSaveOrder } from '@/lib/orderUtils';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { logStructured } from '@/lib/logger';

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const allowed = await checkRateLimit(ip, 'verify-payment', 20, 300000);
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Missing payment verification details.' }, { status: 400 });
    }

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
      logStructured('PAYMENT', { status: 'failed', reason: 'signature_mismatch', razorpay_order_id });
      return NextResponse.json({ success: false, error: 'Invalid payment signature. Payment verification failed.' }, { status: 400 });
    }

    await connectDB();

    // Idempotency: Find and Delete the pending payment ATOMICALLY
    const pendingPayment = await PendingPayment.findOneAndDelete({ razorpayOrderId: razorpay_order_id });
    
    if (!pendingPayment) {
      // If we don't find it, it means EITHER it was already processed (by webhook or retry), OR it expired/didn't exist.
      // Let's check if the Order actually exists.
      const existingOrder = await Order.findOne({ razorpayOrderId: razorpay_order_id });
      if (existingOrder) {
        logStructured('PAYMENT', { status: 'success', message: 'Already processed', razorpay_order_id });
        return NextResponse.json({ success: true, data: existingOrder }, { status: 200 });
      } else {
        logStructured('PAYMENT', { status: 'failed', reason: 'pending_payment_not_found', razorpay_order_id });
        return NextResponse.json({ success: false, error: 'Payment session expired or invalid.' }, { status: 400 });
      }
    }

    // Build the final order using the secure snapshot from PendingPayment
    const finalOrder = {
      ...pendingPayment.orderData,
      paymentMethod: 'Razorpay',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      paymentTimestamp: new Date(),
    };

    // Process order (includes atomic stock deduction and emails)
    const newOrder = await processAndSaveOrder(finalOrder);

    logStructured('PAYMENT', { status: 'success', orderId: newOrder._id, razorpay_order_id });
    return NextResponse.json({ success: true, data: newOrder }, { status: 201 });

  } catch (error) {
    console.error("Payment Verification Error full details:", error);
    return NextResponse.json({ success: false, error: 'We encountered a temporary issue while verifying your payment. Please contact support if your account was charged.' }, { status: 500 });
  }
}
