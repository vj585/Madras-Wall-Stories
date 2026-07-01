import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly');
    
    await connectDB();
    const query = activeOnly === 'true' ? { status: 'Active' } : {};
    const products = await Product.find(query).sort({ displayOrder: 1, createdAt: -1 });
    
    // Migration fallback for legacy products
    const mappedProducts = products.map(p => {
      const prod = p.toObject();
      if (!prod.variants || prod.variants.length === 0) {
        if (prod.price && prod.sizes && prod.sizes.length > 0) {
           prod.variants = prod.sizes.map(size => ({
             size: size,
             price: prod.price,
             salePrice: prod.salePrice || prod.price,
             costPrice: 0,
             stock: prod.stock || 0,
             gst: 18,
             frames: prod.frameOptions || [],
             enabled: true
           }));
        } else if (prod.price) {
           prod.variants = [{
             size: 'Standard',
             price: prod.price,
             salePrice: prod.salePrice || prod.price,
             costPrice: 0,
             stock: prod.stock || 0,
             gst: 18,
             frames: prod.frameOptions || [],
             enabled: true
           }];
        }
      }
      return prod;
    });

    return NextResponse.json({ success: true, data: mappedProducts }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const requiredFields = ['title', 'slug', 'category'];
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return NextResponse.json({ success: false, error: `Missing required field: ${field}` }, { status: 400 });
      }
    }
    
    if (!body.variants || !Array.isArray(body.variants) || body.variants.length === 0) {
      return NextResponse.json({ success: false, error: 'At least one variant is required' }, { status: 400 });
    }
    
    // Sanitize slug
    if (body.slug) {
      body.slug = body.slug.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
    }

    const newProduct = await Product.create(body);
    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'Duplicate slug entered' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
