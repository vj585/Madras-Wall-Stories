import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';

export async function POST(request) {
  try {
    const { orderId, email } = await request.json();

    if (!orderId || !email) {
      return NextResponse.json(
        { success: false, error: 'Order ID and Email are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findOne({ 
      _id: orderId, 
      email: email.toLowerCase() 
    }).lean();

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found or email does not match.' },
        { status: 404 }
      );
    }

    // Return only necessary data for tracking to prevent sensitive info leakage
    // although if they have the email, they technically own the order.
    const trackingData = {
      _id: order._id,
      createdAt: order.createdAt,
      orderStatus: order.orderStatus,
      shippingStatus: order.shippingStatus,
      statusTimeline: order.statusTimeline,
      trackingNumber: order.trackingNumber,
      courierName: order.courierName,
      deliveryPartner: order.deliveryPartner,
      trackingUrl: order.trackingUrl,
      estimatedDelivery: order.estimatedDelivery,
      shippingNotes: order.shippingNotes,
      products: order.products,
      amount: order.amount,
      subtotal: order.subtotal,
      shipping: order.shipping,
      coupon: order.coupon,
      paymentMethod: order.paymentMethod,
      addressSnapshot: order.addressSnapshot,
      shippingAddress: order.shippingAddress
    };

    return NextResponse.json({ success: true, data: trackingData }, { status: 200 });
  } catch (error) {
    console.error('Error tracking order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve order tracking details' },
      { status: 500 }
    );
  }
}
