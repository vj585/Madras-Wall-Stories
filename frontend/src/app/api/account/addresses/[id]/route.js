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
    const payload = await request.json();

    await connectDB();
    
    const customer = await Customer.findById(session.user.id);
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    const address = customer.savedAddresses.id(id);
    if (!address) {
      return NextResponse.json({ success: false, error: 'Address not found' }, { status: 404 });
    }

    // Update fields
    if (payload.fullName) address.fullName = payload.fullName;
    if (payload.phone) address.phone = payload.phone;
    if (payload.houseOrApartment) address.houseOrApartment = payload.houseOrApartment;
    if (payload.street) address.street = payload.street;
    if (payload.areaOrLocality !== undefined) address.areaOrLocality = payload.areaOrLocality;
    if (payload.landmark !== undefined) address.landmark = payload.landmark;
    if (payload.city) address.city = payload.city;
    if (payload.state) address.state = payload.state;
    if (payload.pincode) address.pincode = payload.pincode;
    if (payload.addressType) address.addressType = payload.addressType;

    if (payload.isDefault) {
      customer.defaultAddress = address._id;
    }

    await customer.save();

    return NextResponse.json({ success: true, data: customer.savedAddresses }, { status: 200 });
  } catch (error) {
    console.error('Error updating address:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
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

    customer.savedAddresses.pull(id);

    // If default address was deleted, unset it or pick the first one
    if (customer.defaultAddress && customer.defaultAddress.toString() === id) {
      customer.defaultAddress = customer.savedAddresses.length > 0 ? customer.savedAddresses[0]._id : null;
    }

    await customer.save();

    return NextResponse.json({ success: true, data: customer.savedAddresses }, { status: 200 });
  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
