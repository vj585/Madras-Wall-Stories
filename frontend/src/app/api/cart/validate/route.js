import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';

export async function POST(request) {
  try {
    await connectDB();
    const { cartItems } = await request.json();

    if (!cartItems || !cartItems.length) {
      return NextResponse.json({ success: true, invalidItems: [] }, { status: 200 });
    }

    const invalidItems = [];

    for (const item of cartItems) {
      if (item.isCustom) continue; // Custom prints are not tied to specific products

      let product = null;
      if (item.productId) {
        product = await Product.findById(item.productId).lean();
      } else if (item.slug) {
        product = await Product.findOne({ slug: item.slug }).lean();
      }

      if (!product || product.status !== 'Active') {
        invalidItems.push(item);
      }
    }

    return NextResponse.json({ success: true, invalidItems }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
