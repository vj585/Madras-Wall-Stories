import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AdminUser from '@/models/AdminUser';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import bcrypt from 'bcrypt';
import AuditLog from '@/models/AuditLog';
import AdminOTP from '@/models/AdminOTP';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const adminUsers = await AdminUser.find({}).sort({ createdAt: -1 }).select('-password');
    return NextResponse.json({ success: true, data: adminUsers }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();

    const requiredFields = ['name', 'email', 'password', 'otp'];
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return NextResponse.json({ success: false, error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Verify OTP
    const validOtp = await AdminOTP.findOneAndDelete({
      email: session.user.email,
      otp: body.otp,
      action: 'ADD_ADMIN'
    });

    if (!validOtp) {
      return NextResponse.json({ success: false, error: 'Invalid or expired OTP' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);
    body.password = hashedPassword;
    body.role = 'ADMIN'; // Force ADMIN role for creation from this endpoint

    const newAdminUser = await AdminUser.create(body);

    await AuditLog.create({
      adminEmail: session.user.email,
      action: 'CREATED_ADMIN',
      resourceId: newAdminUser._id.toString(),
      details: { newAdminEmail: newAdminUser.email }
    });

    const userResponse = newAdminUser.toObject();
    delete userResponse.password;

    return NextResponse.json({ success: true, data: userResponse }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role?.toUpperCase() !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const targetAdminId = searchParams.get('id');
    const otp = searchParams.get('otp');

    if (!targetAdminId || !otp) {
      return NextResponse.json({ success: false, error: 'Missing target ID or OTP' }, { status: 400 });
    }

    // Verify OTP
    const validOtp = await AdminOTP.findOneAndDelete({
      email: session.user.email,
      otp,
      action: 'REMOVE_ADMIN'
    });

    if (!validOtp) {
      return NextResponse.json({ success: false, error: 'Invalid or expired OTP' }, { status: 400 });
    }

    const targetAdmin = await AdminUser.findById(targetAdminId);
    if (!targetAdmin) {
      return NextResponse.json({ success: false, error: 'Admin not found' }, { status: 404 });
    }

    // Prevent self-deletion
    if (targetAdmin.email.toLowerCase() === session.user.email.toLowerCase()) {
      return NextResponse.json({ success: false, error: 'You cannot remove your own admin account' }, { status: 400 });
    }

    await AdminUser.findByIdAndDelete(targetAdminId);

    await AuditLog.create({
      adminEmail: session.user.email,
      action: 'DELETED_ADMIN',
      resourceId: targetAdminId,
      details: { deletedAdminEmail: targetAdmin.email }
    });

    return NextResponse.json({ success: true, message: 'Admin removed successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
