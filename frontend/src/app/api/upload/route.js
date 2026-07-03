import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export const runtime = 'nodejs'; // Use Node.js runtime for streams and Buffer

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image'); // Expecting 'image' field in form

    if (!file) {
      return NextResponse.json({ success: false, error: 'No image file provided.' }, { status: 400 });
    }

    // Validation: Mime Type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'Invalid file type. Only JPG, PNG, and WEBP are allowed.' }, { status: 400 });
    }

    // Validation: File Size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: 'File exceeds 10MB limit.' }, { status: 400 });
    }

    // Convert Web API File to Base64 String
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');
    const fileUri = `data:${file.type};base64,${base64Data}`;

    // Upload to Cloudinary using base64 string
    const uploadResult = await cloudinary.uploader.upload(fileUri, {
      folder: 'madras_wall_stories',
      resource_type: 'auto'
    });

    return NextResponse.json({ 
      success: true, 
      imageUrl: uploadResult.secure_url 
    }, { status: 200 });

  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    return NextResponse.json({ success: false, error: 'Failed to upload image to Cloudinary.' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json();
    const { publicId } = body;

    if (!publicId) {
      return NextResponse.json({ success: false, error: 'Cloudinary publicId is required for deletion.' }, { status: 400 });
    }

    // Future-ready delete architecture
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== 'ok') {
      throw new Error('Cloudinary deletion failed');
    }

    return NextResponse.json({ success: true, message: 'Image deleted securely.' }, { status: 200 });
  } catch (error) {
    console.error("Cloudinary Delete Error:", error);
    return NextResponse.json({ success: false, error: 'Failed to delete image.' }, { status: 500 });
  }
}
