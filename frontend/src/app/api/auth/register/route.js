import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { connectDB } from '@/lib/mongodb';
import Customer from '@/models/Customer';
import VerificationToken from '@/models/VerificationToken';
import { sendVerificationEmail } from '@/lib/mail';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(req) {
  try {
    const ip = getClientIp(req);
    // Max 3 registrations per IP per hour
    const allowed = await checkRateLimit(ip, 'register', 3, 3600000);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many registration attempts. Please try again later.' }, { status: 429 });
    }

    const { name, email, phone, password } = await req.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Password strength validation
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    await connectDB();

    // Check if email is already in use
    const existingUser = await Customer.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      if (existingUser.authProvider === 'google') {
        return NextResponse.json({ error: 'An account with this email already exists via Google Login. Please sign in with Google.' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Email is already registered. Please login.' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create Customer
    const newCustomer = await Customer.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role: 'customer',
      authProvider: 'email',
      emailVerified: false
    });

    // Generate Verification Token
    const plainToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(plainToken).digest('hex');

    // Token expires in 15 minutes
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Save hashed token
    await VerificationToken.create({
      email: newCustomer.email,
      token: hashedToken,
      expiresAt
    });

    // Send email with plain token
    await sendVerificationEmail(newCustomer.email, plainToken);

    return NextResponse.json({ success: true, message: 'Account created successfully. Please verify your email.' }, { status: 201 });

  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Failed to register account. Please try again later.' }, { status: 500 });
  }
}

