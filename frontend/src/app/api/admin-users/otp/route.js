import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AdminOTP from '@/models/AdminOTP';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { sendAdminOTP } from '@/lib/mail';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role?.toUpperCase() !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await request.json();

    if (!['ADD_ADMIN', 'REMOVE_ADMIN'].includes(action)) {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    const adminEmail = session.user.email;
    if (!adminEmail) {
      return NextResponse.json({ success: false, error: 'No admin email found in session' }, { status: 400 });
    }

    await connectDB();

    // Generate a 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Delete any existing OTP for this admin and action to prevent spam/confusion
    await AdminOTP.deleteMany({ email: adminEmail, action });

    // Save the new OTP (expires in 10 minutes)
    await AdminOTP.create({
      email: adminEmail,
      otp,
      action,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    // Send the email
    await sendAdminOTP(adminEmail, otp, action);

    return NextResponse.json({ success: true, message: 'OTP sent successfully' }, { status: 200 });

  } catch (error) {
    console.error("OTP Generation Error:", error);
    return NextResponse.json({ success: false, error: 'Failed to send OTP' }, { status: 500 });
  }
}

