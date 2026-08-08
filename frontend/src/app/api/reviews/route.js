import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Review from "@/models/Review";
import Product from "@/models/Product";
import mongoose from "mongoose";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    await connectDB();

    const reviews = await Review.find({ 
      product: productId, 
      status: 'Approved' 
    })
    .populate('customer', 'name avatar')
    .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, reviews }, { status: 200 });

  } catch (error) {
    console.error("GET Reviews Error:", error);
    return NextResponse.json({ success: false, error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ success: false, error: 'You must be logged in to leave a review.' }, { status: 401 });
    }

    const { productId, rating } = await request.json();

    if (!productId || !rating) {
      return NextResponse.json({ success: false, error: 'Product ID and rating are required.' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: 'Rating must be between 1 and 5.' }, { status: 400 });
    }

    await connectDB();

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      customer: session.user.id
    });

    if (existingReview) {
      return NextResponse.json({ success: false, error: 'You have already reviewed this product.' }, { status: 400 });
    }

    const newReview = await Review.create({
      product: productId,
      customer: session.user.id,
      rating: Number(rating),
      status: 'Approved' // Auto approve
    });

    // Update Product average rating and numReviews
    const product = await Product.findById(productId);
    if (product) {
      const currentTotalRating = product.rating * product.numReviews;
      product.numReviews += 1;
      product.rating = parseFloat(((currentTotalRating + Number(rating)) / product.numReviews).toFixed(1));
      await product.save();
    }

    return NextResponse.json({ success: true, message: 'Review submitted successfully!', review: newReview }, { status: 201 });

  } catch (error) {
    console.error("POST Review Error:", error);
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'You have already reviewed this product.' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to submit review' }, { status: 500 });
  }
}

