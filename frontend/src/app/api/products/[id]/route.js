import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import mongoose from 'mongoose';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid Product ID format' }, { status: 400 });
    }

    await connectDB();
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    let prod = product.toObject();
    
    // Migration fallback for legacy product
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

    return NextResponse.json({ success: true, data: prod }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role?.toUpperCase() !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid Product ID format' }, { status: 400 });
    }

    await connectDB();
    const body = await request.json();

    // Sanitize slug
    if (body.slug) {
      body.slug = body.slug.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
    }

    const product = await Product.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product }, { status: 200 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'Duplicate slug entered' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role?.toUpperCase() !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid Product ID format' }, { status: 400 });
    }

    await connectDB();
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
