import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { sendTrackingEmail } from "@/lib/email";
import { sendTrackingSMS } from "@/lib/sms";

export async function POST(request) {
  try {
    const payload = await request.json();

    // The AWB code is generally provided in the payload body by Shiprocket
    const awbCode = payload.awb;
    const currentStatus = payload.current_status; // String e.g. "SHIPPED", "DELIVERED", "OUT FOR DELIVERY"

    if (!awbCode || !currentStatus) {
      return NextResponse.json({ success: false, error: 'Missing awb or status' }, { status: 400 });
    }

    await connectDB();
    const order = await Order.findOne({ trackingId: awbCode });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found for AWB' }, { status: 404 });
    }

    // Map Shiprocket Status to Internal Status
    let mappedStatus = order.shippingStatus;
    const statusUpper = currentStatus.toUpperCase();

    if (statusUpper.includes('DELIVERED')) mappedStatus = 'Delivered';
    else if (statusUpper.includes('OUT FOR DELIVERY')) mappedStatus = 'Out For Delivery';
    else if (statusUpper.includes('SHIPPED') || statusUpper.includes('IN TRANSIT')) mappedStatus = 'Shipped';
    else if (statusUpper.includes('CANCELLED')) mappedStatus = 'Cancelled';
    else mappedStatus = 'Shipped'; // Fallback for intermediate transit states

    // Update if the status has actually changed
    if (order.shippingStatus !== mappedStatus) {
      order.shippingStatus = mappedStatus;
      
      // Prevent duplicate timeline entries if webhooks retry
      const lastTimelineStatus = order.statusTimeline.length > 0 
        ? order.statusTimeline[order.statusTimeline.length - 1].status 
        : null;

      if (lastTimelineStatus !== mappedStatus) {
        order.statusTimeline.push({
          status: mappedStatus,
          timestamp: new Date()
        });
      }

      await order.save();

      // Trigger Email/SMS Notifications for critical events
      if (['Shipped', 'Out For Delivery', 'Delivered'].includes(mappedStatus)) {
        try {
          await Promise.all([
            sendTrackingEmail(order, mappedStatus),
            sendTrackingSMS(order, mappedStatus)
          ]);
        } catch (notificationErr) {
          console.error("Failed to send tracking notification:", notificationErr);
          // Don't fail the webhook if notifications fail
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error("Shiprocket Webhook Error:", error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
