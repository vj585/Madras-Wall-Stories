import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import mongoose from 'mongoose';
import { sendStatusUpdateNotification } from '@/lib/orderUtils';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role?.toUpperCase() !== 'ADMIN') {
    return false;
  }
  return true;
}

export async function GET(request, { params }) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid Order ID format' }, { status: 400 });
    }

    await connectDB();
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid Order ID format' }, { status: 400 });
    }

    await connectDB();
    const body = await request.json();

    const order = await Order.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid Order ID format' }, { status: 400 });
    }

    await connectDB();
    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid Order ID format' }, { status: 400 });
    }

    await connectDB();
    const body = await request.json();

    const allowedFields = ['orderStatus', 'shippingStatus', 'trackingNumber', 'trackingUrl', 'dispatchDate', 'estimatedDelivery', 'shippingNotes', 'courierCharge', 'packageWeight', 'courierName', 'deliveryPartner'];
    const updateData = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }

    const updateQuery = { $set: updateData };
    let newTimelineStatus = null;

    if (body.shippingStatus || body.orderStatus) {
      newTimelineStatus = body.shippingStatus || body.orderStatus;
      updateQuery.$push = {
        statusTimeline: { status: newTimelineStatus, timestamp: new Date() }
      };
    }

    const order = await Order.findByIdAndUpdate(id, updateQuery, {
      new: true,
      runValidators: true,
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    if (newTimelineStatus && ['Packed', 'Shipped', 'Out For Delivery', 'Delivered'].includes(newTimelineStatus)) {
      await sendStatusUpdateNotification(order, newTimelineStatus);
    }

    return NextResponse.json({ success: true, data: order }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

