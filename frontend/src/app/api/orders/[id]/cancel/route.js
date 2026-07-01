import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid Order ID format' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Role-based authorization and state validation
    const isAdmin = session.user.role === 'admin';
    const isOwner = session.user.email === order.email;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ success: false, error: 'Unauthorized to cancel this order' }, { status: 403 });
    }

    if (order.orderStatus === 'Cancelled') {
      return NextResponse.json({ success: false, error: 'Order is already cancelled' }, { status: 400 });
    }

    if (!isAdmin && !['Pending', 'Processing'].includes(order.orderStatus)) {
      return NextResponse.json({ success: false, error: 'Order cannot be cancelled by customer at this stage. Please contact support.' }, { status: 400 });
    }

    if (isAdmin && ['Delivered'].includes(order.orderStatus)) {
      return NextResponse.json({ success: false, error: 'Cannot cancel a delivered order' }, { status: 400 });
    }

    // Shiprocket cancellation removed.

    // Restore Stock
    for (const item of order.products) {
      if (item.productId && !item.isCustom) {
        // Find product
        const product = await Product.findById(item.productId);
        if (product) {
          // Find matching variant
          const variant = product.variants.find(v => v.size === item.size);
          if (variant) {
            variant.stock += (item.quantity || 1);
          } else {
            // Fallback to deprecated stock field if variant not found
            product.stock += (item.quantity || 1);
          }
          await product.save();
        }
      }
    }

    // Update Order Status
    order.orderStatus = 'Cancelled';
    order.shippingStatus = 'Cancelled';
    
    // We do NOT automatically refund payment here (e.g., Razorpay) as that requires manual handling 
    // or deeper integration with Razorpay Refunds API.
    
    order.statusTimeline.push({
      status: 'Cancelled',
      timestamp: new Date()
    });

    await order.save();

    return NextResponse.json({ success: true, message: 'Order cancelled successfully', data: order }, { status: 200 });

  } catch (error) {
    console.error("Order Cancellation Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
