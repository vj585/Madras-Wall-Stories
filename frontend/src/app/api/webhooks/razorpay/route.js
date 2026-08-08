import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import PendingPayment from '@/models/PendingPayment';
import { processAndSaveOrder } from '@/lib/orderUtils';
import { logStructured } from '@/lib/logger';

export async function POST(request) {
  try {
    const bodyText = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      logStructured('WEBHOOK', { status: 'failed', reason: 'missing_signature' });
      return NextResponse.json({ success: false, error: 'Missing signature' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error("Missing RAZORPAY_WEBHOOK_SECRET in backend");
      return NextResponse.json({ success: false, error: 'Configuration error' }, { status: 500 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(bodyText)
      .digest('hex');

    if (expectedSignature !== signature) {
      logStructured('WEBHOOK', { status: 'failed', reason: 'signature_mismatch' });
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(bodyText);

    // Only process relevant events
    if (event.event !== 'payment.captured' && event.event !== 'order.paid') {
      return NextResponse.json({ success: true, message: 'Event ignored' }, { status: 200 });
    }

    const paymentEntity = event.payload.payment.entity;
    const razorpayOrderId = paymentEntity.order_id;
    const razorpayPaymentId = paymentEntity.id;

    await connectDB();

    // Idempotency: Find and Delete the pending payment ATOMICALLY
    const pendingPayment = await PendingPayment.findOneAndDelete({ razorpayOrderId: razorpayOrderId });
    
    if (!pendingPayment) {
      // If we don't find it, it means EITHER it was already processed (by frontend), OR it never existed.
      const existingOrder = await Order.findOne({ razorpayOrderId: razorpayOrderId });
      if (existingOrder) {
        logStructured('WEBHOOK', { status: 'success', message: 'Already processed', razorpayOrderId });
        return NextResponse.json({ success: true, message: 'Already processed' }, { status: 200 });
      } else {
        logStructured('WEBHOOK', { status: 'failed', reason: 'pending_payment_not_found', razorpayOrderId });
        // Return 200 so Razorpay stops retrying an invalid webhook for a non-existent order
        return NextResponse.json({ success: true, message: 'Payment session expired or invalid' }, { status: 200 });
      }
    }

    // Build the final order using the secure snapshot from PendingPayment
    const finalOrder = {
      ...pendingPayment.orderData,
      paymentMethod: 'Razorpay',
      razorpayOrderId: razorpayOrderId,
      razorpayPaymentId: razorpayPaymentId,
      paymentTimestamp: new Date(),
    };

    // Process order (includes atomic stock deduction and emails)
    const newOrder = await processAndSaveOrder(finalOrder);

    logStructured('WEBHOOK', { status: 'success', event: event.event, orderId: newOrder._id, razorpayOrderId });
    return NextResponse.json({ success: true, message: 'Order processed successfully' }, { status: 200 });

  } catch (error) {
    console.error("Webhook processing error:", error);
    // For other unexpected errors, return 500 so Razorpay retries
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

