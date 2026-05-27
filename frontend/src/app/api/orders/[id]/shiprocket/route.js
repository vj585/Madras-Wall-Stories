import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { createShipment, generateAWB, requestPickup, fetchLabel } from "@/lib/shiprocket";

export async function POST(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const { action } = await request.json();

    const order = await Order.findById(id);
    if (!order) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });

    if (action === 'create_shipment') {
      if (order.shipmentId) {
        return NextResponse.json({ success: false, error: 'Shipment already exists for this order.' }, { status: 400 });
      }

      // Step 1: Create Shipment
      const orderData = {
        orderId: order._id.toString(),
        createdAt: order.createdAt,
        customerName: order.customerName,
        email: order.email,
        phone: order.phone,
        amount: order.amount,
        paymentMethod: order.paymentMethod,
        shippingAddress: order.shippingAddress,
        products: order.products
      };

      const shipmentRes = await createShipment(orderData);
      
      if (shipmentRes.success) {
        order.shipmentId = shipmentRes.shipmentId;
        
        // Step 2: Automatically generate AWB if shipment is created
        const awbRes = await generateAWB(shipmentRes.shipmentId);
        
        if (awbRes.success) {
          order.awbCode = awbRes.awbCode;
          order.courierName = awbRes.courierName;
          order.trackingId = awbRes.awbCode;
          order.shippingStatus = 'Packed';
          order.statusTimeline.push({ status: 'Packed', timestamp: new Date() });
          
          await order.save();
          return NextResponse.json({ success: true, message: 'Shipment created and AWB generated.' });
        } else {
          await order.save(); // Save shipment ID even if AWB fails
          return NextResponse.json({ success: false, error: `Shipment created but AWB failed: ${awbRes.error}` }, { status: 500 });
        }
      } else {
        return NextResponse.json({ success: false, error: shipmentRes.error }, { status: 500 });
      }
    }

    if (action === 'request_pickup') {
      if (!order.shipmentId) {
        return NextResponse.json({ success: false, error: 'No shipment ID found for this order.' }, { status: 400 });
      }
      
      const pickupRes = await requestPickup(order.shipmentId);
      
      if (pickupRes.success) {
        order.shippingStatus = 'Ready For Pickup';
        order.statusTimeline.push({ status: 'Ready For Pickup', timestamp: new Date() });
        await order.save();
        return NextResponse.json({ success: true, message: 'Pickup requested successfully.' });
      } else {
        return NextResponse.json({ success: false, error: pickupRes.error }, { status: 500 });
      }
    }

    if (action === 'fetch_label') {
      if (!order.shipmentId) {
        return NextResponse.json({ success: false, error: 'No shipment ID found for this order.' }, { status: 400 });
      }

      const labelRes = await fetchLabel(order.shipmentId);
      
      if (labelRes.success) {
        return NextResponse.json({ success: true, labelUrl: labelRes.labelUrl });
      } else {
        return NextResponse.json({ success: false, error: labelRes.error }, { status: 500 });
      }
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error("Shiprocket API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
