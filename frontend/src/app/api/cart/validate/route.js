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
    const outOfStockItems = [];

    for (const item of cartItems) {
      if (item.isCustom) continue; // Custom prints are not tied to specific products

      let product = null;
      const productId = item.productId || item._id;
      const productSlug = item.slug || item.id;
      
      if (productId) {
        product = await Product.findById(productId).lean();
      } else if (productSlug) {
        product = await Product.findOne({ slug: productSlug }).lean();
      }

      if (!product || (product.status && product.status !== 'Active')) {
        invalidItems.push(item);
        continue;
      }

      // Check stock
      let availableStock = 0;
      if (product.variants && product.variants.length > 0) {
        const variant = product.variants.find(v => v.size === item.size);
        if (variant) {
          availableStock = variant.stock || 0;
        }
      } else {
        availableStock = product.stock || 0;
      }

      if (availableStock < (item.quantity || 1)) {
        outOfStockItems.push(item);
      }
    }

    return NextResponse.json({ success: true, invalidItems, outOfStockItems }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
