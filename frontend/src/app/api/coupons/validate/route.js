import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Coupon from '@/models/Coupon';

export async function POST(request) {
  try {
    await connectDB();
    const { code, cartTotal } = await request.json();

    if (!code) {
      return NextResponse.json({ success: false, error: 'Coupon code is required' }, { status: 400 });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return NextResponse.json({ success: false, error: 'Invalid coupon code' }, { status: 404 });
    }

    if (!coupon.active) {
      return NextResponse.json({ success: false, error: 'This coupon is no longer active' }, { status: 400 });
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return NextResponse.json({ success: false, error: 'This coupon has expired' }, { status: 400 });
    }

    if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ success: false, error: 'This coupon has reached its usage limit' }, { status: 400 });
    }

    // Since minOrderAmount is not strictly in the schema but could be added, let's gracefully ignore it if it doesn't exist.
    // If it was added to the schema or saved as any other field, we'd check it here. Let's assume schema might allow any fields.
    if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
      return NextResponse.json({ success: false, error: `Minimum order amount of ₹${coupon.minOrderAmount} required` }, { status: 400 });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discountType === 'Percentage') {
      discountAmount = Math.floor((cartTotal * coupon.discountValue) / 100);
    } else if (coupon.discountType === 'Fixed Amount') {
      discountAmount = coupon.discountValue;
    }

    // Ensure discount doesn't exceed total
    if (discountAmount > cartTotal) {
      discountAmount = cartTotal;
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discountAmount
      } 
    }, { status: 200 });

  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json({ success: false, error: 'Server error during validation' }, { status: 500 });
  }
}
