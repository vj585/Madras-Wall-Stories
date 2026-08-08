import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import Customer from '@/models/Customer';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'customer') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const customer = await Customer.findById(session.user.id).lean();
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        savedAddresses: customer.savedAddresses || [],
        defaultAddress: customer.defaultAddress || null,
        customerPhone: customer.phone || ''
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'customer') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await request.json();

    // Basic validation
    if (!payload.fullName || !payload.phone || !payload.houseOrApartment || !payload.street || !payload.city || !payload.state || !payload.pincode) {
      return NextResponse.json({ success: false, error: 'Missing required address fields' }, { status: 400 });
    }

    await connectDB();
    
    const customer = await Customer.findById(session.user.id);
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    // Add to savedAddresses
    customer.savedAddresses.push({
      fullName: payload.fullName,
      phone: payload.phone,
      houseOrApartment: payload.houseOrApartment,
      street: payload.street,
      areaOrLocality: payload.areaOrLocality,
      landmark: payload.landmark,
      city: payload.city,
      state: payload.state,
      pincode: payload.pincode,
      addressType: payload.addressType || 'Home'
    });

    // If it's the first address or set as default explicitly
    const newAddressId = customer.savedAddresses[customer.savedAddresses.length - 1]._id;
    if (customer.savedAddresses.length === 1 || payload.isDefault) {
      customer.defaultAddress = newAddressId;
    }

    await customer.save();

    return NextResponse.json({ success: true, data: customer.savedAddresses }, { status: 201 });
  } catch (error) {
    console.error('Error saving address:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}

