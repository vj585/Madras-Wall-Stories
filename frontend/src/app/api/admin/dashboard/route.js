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

    // Fetch all non-cancelled orders to calculate overall stats
    // We populate productId to get the category for top categories calculation
    const allValidOrders = await Order.find({ orderStatus: { $ne: 'Cancelled' } })
      .populate('products.productId', 'category')
      .sort({ createdAt: -1 });

    const totalOrders = allValidOrders.length;
    let totalRevenue = 0;
    let pendingOrders = 0;
    let deliveredOrders = 0;
    let customPrintOrders = 0;

    const categoryTally = {};

    allValidOrders.forEach(order => {
      totalRevenue += order.amount || 0;
      
      if (order.orderStatus === 'Pending') pendingOrders++;
      if (order.orderStatus === 'Delivered') deliveredOrders++;

      let hasCustom = false;
      order.products.forEach(item => {
        if (item.isCustom) hasCustom = true;

        // Tally categories
        if (item.productId && item.productId.category) {
          const cat = item.productId.category;
          categoryTally[cat] = (categoryTally[cat] || 0) + (item.quantity || 1);
        }
      });
      if (hasCustom) customPrintOrders++;
    });

    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const productsListed = await Product.countDocuments();

    // Format Top Categories array
    const topCategories = Object.entries(categoryTally)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // top 5

    // Get Recent 10 Orders
    const recentOrders = allValidOrders.slice(0, 10).map(order => ({
      id: order._id.toString().slice(-6).toUpperCase(), // Short ID
      customer: order.customerName,
      date: new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      amount: order.amount,
      status: order.orderStatus
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        productsListed,
        customPrintOrders,
        averageOrderValue,
        recentOrders,
        topCategories
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ success: false, error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
