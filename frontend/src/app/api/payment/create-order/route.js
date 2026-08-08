import { NextResponse } from 'next/server';
import razorpay from '@/lib/razorpay';
import { calculateSecureOrderTotal } from '@/lib/serverPricing';
import { calculateShippingFee } from '@/utils/shippingUtils';
import { connectDB } from '@/lib/mongodb';
import PendingPayment from '@/models/PendingPayment';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    // Max 10 attempts per IP per 5 minutes (300000 ms)
    const allowed = await checkRateLimit(ip, 'create-order', 10, 300000);
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { amount, orderDetails } = await request.json();

    if (!amount || amount <= 0 || !orderDetails || !orderDetails.products || !orderDetails.products.length) {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }

    await connectDB();

    // 1. Calculate secure subtotal from DB
    const { subtotal, discountAmount, recalculatedProducts } = await calculateSecureOrderTotal(orderDetails.products, orderDetails.coupon);
    
    // 2. Calculate secure shipping
    const shipping = calculateShippingFee(subtotal);
    
    // 3. Compute true grand total
    const grandTotal = subtotal - discountAmount + shipping;

    // 4. Reject mismatch (Tamper protection)
    if (grandTotal !== amount) {
      console.error(`Price mismatch detected! Frontend sent: ${amount}, Backend computed: ${grandTotal} (Subtotal: ${subtotal}, Discount: ${discountAmount}, Shipping: ${shipping})`);
      return NextResponse.json({ success: false, error: 'Price mismatch detected. Please refresh the page.' }, { status: 400 });
    }

    // Prepare complete secure order data snapshot
    const secureOrderData = {
      ...orderDetails,
      products: recalculatedProducts,
      subtotal,
      discountAmount,
      shipping,
      grandTotal,
      amount: grandTotal,
      freeShippingApplied: shipping === 0,
      paymentMethod: 'Razorpay',
    };

    // 5. Razorpay amount is in paise (₹1 = 100 paise)
    const options = {
      amount: grandTotal * 100, 
      currency: "INR",
      receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    };

    const order = await razorpay.orders.create(options);
    
    // 6. Store PendingPayment for Webhook and Verification processing
    await PendingPayment.create({
      razorpayOrderId: order.id,
      amount: grandTotal,
      orderData: secureOrderData
    });

    console.log("Create order payload successful, PendingPayment stored:", order.id);

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

