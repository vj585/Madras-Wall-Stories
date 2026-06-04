import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { processAndSaveOrder } from '@/lib/orderUtils';
import { calculateSecureOrderTotal } from '@/lib/serverPricing';
import { calculateShippingFee } from '@/utils/shippingUtils';

export async function GET() {
  try {
    await connectDB();
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: orders }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
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
    const { subtotal, recalculatedProducts } = await calculateSecureOrderTotal(body.products || []);
    const shipping = calculateShippingFee(subtotal);
    const grandTotal = subtotal + shipping;

    const finalOrder = {
      ...body,
      products: recalculatedProducts,
      subtotal,
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
