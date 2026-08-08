import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { processAndSaveOrder } from '@/lib/orderUtils';
import { calculateSecureOrderTotal } from '@/lib/serverPricing';
import { calculateShippingFee } from '@/utils/shippingUtils';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role?.toUpperCase() !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: orders }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    // Limit COD spam: 5 orders per 10 minutes per IP
    const allowed = await checkRateLimit(ip, 'create-cod-order', 5, 600000);
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Too many orders placed recently. Please try again later.' }, { status: 429 });
    }

    await connectDB();
    const body = await request.json();

    const requiredFields = ['customerName', 'email', 'phone', 'amount', 'paymentMethod'];
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return NextResponse.json({ success: false, error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    if (body.paymentMethod !== 'COD') {
      return NextResponse.json({ success: false, error: 'Direct order creation is only allowed for COD. Use Razorpay flow for prepaid orders.' }, { status: 400 });
    }

    // Phase 5 & 6: Immutable Server-Side Pricing Verification (COD)
    const { subtotal, discountAmount, recalculatedProducts } = await calculateSecureOrderTotal(body.products || [], body.coupon);
    const shipping = calculateShippingFee(subtotal); // Note: shipping is often calculated on subtotal before discount, depending on business logic. 
    // Wait, let's keep it based on subtotal.
    const grandTotal = subtotal - discountAmount + shipping;

    // Phase 5 & 6: Reject mismatch (Tamper protection)
    // Coerce to Numbers in case the payload sent them as strings
    if (Number(body.amount) !== grandTotal || 
        (body.shipping !== undefined && Number(body.shipping) !== shipping) || 
        (body.subtotal !== undefined && Number(body.subtotal) !== subtotal)) {
      console.error(`COD Price mismatch! Amount sent: ${body.amount}, Subtotal sent: ${body.subtotal}, Shipping sent: ${body.shipping}. Backend computed GrandTotal: ${grandTotal}, Subtotal: ${subtotal}, Discount: ${discountAmount}, Shipping: ${shipping}`);
      return NextResponse.json({ success: false, error: 'Price mismatch detected. Order rejected.' }, { status: 400 });
    }

    const finalOrder = {
      ...body,
      products: recalculatedProducts,
      subtotal,
      discountAmount,
      shipping,
      grandTotal,
      amount: grandTotal, // Backwards compatibility
      freeShippingApplied: shipping === 0,
      paymentTimestamp: new Date(),
    };

    const newOrder = await processAndSaveOrder(finalOrder);
    
    return NextResponse.json({ success: true, data: newOrder }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

