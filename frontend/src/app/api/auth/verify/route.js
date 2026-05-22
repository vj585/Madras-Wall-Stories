import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/mongodb';
import Customer from '@/models/Customer';
import VerificationToken from '@/models/VerificationToken';

export async function POST(req) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Verification token is required' }, { status: 400 });
    }

    await connectDB();

    // Hash the incoming plain token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find token in DB
    const verificationRecord = await VerificationToken.findOne({ token: hashedToken });

    if (!verificationRecord) {
      return NextResponse.json({ error: 'Verification link expired or invalid. Request a new verification email.' }, { status: 400 });
    }

    // Token exists and is valid. Find user and verify
    const customer = await Customer.findOne({ email: verificationRecord.email });

    if (!customer) {
      return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
    }

    if (customer.emailVerified) {
      return NextResponse.json({ success: true, message: 'Email is already verified.' });
    }

    // Verify user
    customer.emailVerified = true;
    await customer.save();

    // Delete token after successful verification
    await VerificationToken.deleteOne({ _id: verificationRecord._id });

    return NextResponse.json({ success: true, message: 'Email verified successfully! You can now log in.' });

  } catch (error) {
    console.error('Verification Error:', error);
    return NextResponse.json({ error: 'Failed to verify email. Please try again later.' }, { status: 500 });
  }
}
