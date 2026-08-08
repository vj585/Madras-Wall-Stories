import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role?.toUpperCase() !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get today's start and end date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const allOrders = await Order.find({})
      .populate('products.productId', 'title category')
      .sort({ createdAt: -1 });

    const totalOrders = allOrders.length;
    let totalRevenue = 0;
    
    // Status counts
    let awaitingPrinting = 0;
    let awaitingQualityCheck = 0;
    let packed = 0;
    let shipped = 0;
    let delivered = 0;
    let cancelledOrders = 0;

    // Today's metrics
    let todaysOrders = 0;
    let todaysRevenue = 0;
    let todaysCourierCost = 0;

    // Courier metrics
    let totalCourierCost = 0;
    let validCourierOrders = 0;

    const productTally = {};

    allOrders.forEach(order => {
      const isToday = order.createdAt >= today && order.createdAt < tomorrow;

      if (order.orderStatus === 'Cancelled') {
        cancelledOrders++;
      } else {
        // Status counts
        if (order.orderStatus === 'Pending' || order.orderStatus === 'Processing') awaitingPrinting++;
        if (order.orderStatus === 'Printing' || order.orderStatus === 'Quality Check') awaitingQualityCheck++;
        if (order.orderStatus === 'Packed') packed++;
        if (order.orderStatus === 'Shipped' || order.orderStatus === 'Out For Delivery') shipped++;
        if (order.orderStatus === 'Delivered') delivered++;

        // Revenue logic
        let countRevenue = false;
        if (order.paymentMethod === 'COD') {
          if (order.orderStatus === 'Delivered') countRevenue = true;
        } else {
          if (order.paymentStatus === 'Paid') countRevenue = true;
        }

        if (countRevenue) {
          totalRevenue += order.amount || 0;
          if (isToday) todaysRevenue += order.amount || 0;
        }

        if (order.courierCost && order.courierCost > 0) {
          totalCourierCost += order.courierCost;
          validCourierOrders++;
          if (isToday) todaysCourierCost += order.courierCost;
        }

        if (isToday) todaysOrders++;

        // Tally products for Top Selling
        order.products.forEach(item => {
          const key = item.productId ? item.productId.title : item.title;
          if (key) {
            productTally[key] = (productTally[key] || 0) + (item.quantity || 1);
          }
        });
      }
    });

    const averageCourierCost = validCourierOrders > 0 ? Math.round(totalCourierCost / validCourierOrders) : 0;
    
    // Format Top Products
    const topProducts = Object.entries(productTally)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    
    const topSellingProduct = topProducts.length > 0 ? topProducts[0].name : 'N/A';

    // Get Low Stock Products
    const lowStockProducts = await Product.find({ 
      status: 'Active', 
      stock: { $lte: 5 } 
    }).select('title stock').sort({ stock: 1 }).lean();

    // Get Recent 10 Orders
    const recentOrders = allOrders.slice(0, 10).map(order => ({
      id: order._id.toString().slice(-6).toUpperCase(),
      customer: order.customerName,
      date: new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      amount: order.amount,
      status: order.orderStatus
    }));

    return NextResponse.json({
      success: true,
      data: {
        todaysOrders,
        todaysRevenue,
        todaysCourierCost,
        averageCourierCost,
        awaitingPrinting,
        awaitingQualityCheck,
        packed,
        shipped,
        delivered,
        cancelledOrders,
        topSellingProduct,
        lowStockProducts,
        recentOrders
      }
    });

  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ success: false, error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}

