import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import Customer from '@/models/Customer';

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'customer') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    await connectDB();
    
    const customer = await Customer.findById(session.user.id);
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    const address = customer.savedAddresses.id(id);
    if (!address) {
      return NextResponse.json({ success: false, error: 'Address not found' }, { status: 404 });
    }

    customer.defaultAddress = address._id;
    await customer.save();

    return NextResponse.json({ success: true, data: customer.savedAddresses }, { status: 200 });
  } catch (error) {
    console.error('Error setting default address:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
