import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/mongodb';
import Customer from '@/models/Customer';
import VerificationToken from '@/models/VerificationToken';
import { sendVerificationEmail } from '@/lib/mail';
import { LRUCache } from 'lru-cache';

// Rate limiter: max 3 resends per hour per email
const resendRateLimit = new LRUCache({
  max: 500,
  ttl: 1000 * 60 * 60, // 1 hour
});

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const emailLower = email.toLowerCase();
    const attempts = resendRateLimit.get(emailLower) || 0;

    if (attempts >= 3) {
      return NextResponse.json({ error: 'Too many verification requests. Please try again later.' }, { status: 429 });
    }

    await connectDB();

    const customer = await Customer.findOne({ email: emailLower });

    if (!customer) {
      // Don't leak if email exists or not
      return NextResponse.json({ success: true, message: 'If your account exists and is not verified, a new link has been sent.' });
    }

    if (customer.emailVerified) {
      return NextResponse.json({ error: 'Account is already verified. Please login.' }, { status: 400 });
    }

    if (customer.authProvider === 'google') {
      return NextResponse.json({ error: 'Google accounts are automatically verified. Please sign in with Google.' }, { status: 400 });
    }

    // Update rate limit
    resendRateLimit.set(emailLower, attempts + 1);

    // Delete any old tokens for this email
    await VerificationToken.deleteMany({ email: emailLower });

    // Generate Verification Token
    const plainToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(plainToken).digest('hex');

    // Token expires in 15 minutes
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Save hashed token
    await VerificationToken.create({
      email: emailLower,
      token: hashedToken,
      expiresAt
    });

    // Send email with plain token
    await sendVerificationEmail(emailLower, plainToken);

    return NextResponse.json({ success: true, message: 'A new verification link has been sent to your email.' });

  } catch (error) {
    console.error('Resend Verification Error:', error);
    return NextResponse.json({ error: 'Failed to resend verification email. Please try again later.' }, { status: 500 });
  }
}

