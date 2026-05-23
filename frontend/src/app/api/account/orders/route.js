import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'customer') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Fetch orders matching the logged-in customer's email
    // Alternatively, match by customer ID if that's stored in Order.
    // The current Order model relies on `email`.
    const orders = await Order.find({ email: session.user.email })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: orders }, { status: 200 });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
