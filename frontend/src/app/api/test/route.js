import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

export async function GET() {
  try {
    // Attempt to connect to the database
    await connectDB();
    
    return NextResponse.json(
      {
        success: true,
        message: "MongoDB Connected Successfully"
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to connect to the database."
      },
      { status: 500 }
    );
  }
}
