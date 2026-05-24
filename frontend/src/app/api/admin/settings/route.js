import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import StoreSettings from "@/models/StoreSettings";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role?.toUpperCase() !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    let settings = await StoreSettings.findOne({ singletonId: 'global_settings' });
    
    // If it doesn't exist, create it with defaults
    if (!settings) {
      settings = await StoreSettings.create({
        singletonId: 'global_settings',
        framePricing: [
          { name: 'Black', markup: 0 },
          { name: 'White', markup: 0 },
          { name: 'Wood', markup: 0 },
          { name: 'No Frame', markup: 0 }
        ],
        freeShippingThreshold: 599,
        lowCartDeliveryFee: 49,
        mediumCartDeliveryFee: 29,
        sameDayChennaiFee: 99,
        serviceableCities: ['Chennai'],
        pickupCoordinates: {
          latitude: 13.0827,
          longitude: 80.2707
        },
        businessName: 'Madras Wall Stories',
        gstNumber: '',
        supportEmail: 'support@madraswallstories.com',
        phone: '+91 ',
        businessAddress: '',
        whatsappNumber: '',
        instagramProfile: '',
        returnPolicy: ''
      });
    }

    return NextResponse.json({ success: true, data: settings }, { status: 200 });

  } catch (error) {
    console.error("Settings API GET Error:", error);
    return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role?.toUpperCase() !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      framePricing, 
      freeShippingThreshold,
      lowCartDeliveryFee,
      mediumCartDeliveryFee,
      sameDayChennaiFee,
      serviceableCities,
      pickupCoordinates,
      businessName,
      gstNumber,
      supportEmail,
      phone,
      businessAddress,
      whatsappNumber,
      instagramProfile,
      returnPolicy
    } = body;

    await connectDB();

    let settings = await StoreSettings.findOne({ singletonId: 'global_settings' });
    
    if (!settings) {
      settings = new StoreSettings({ singletonId: 'global_settings' });
    }

    if (framePricing && Array.isArray(framePricing)) {
      settings.framePricing = framePricing;
    }
    if (freeShippingThreshold !== undefined) settings.freeShippingThreshold = freeShippingThreshold;
    if (lowCartDeliveryFee !== undefined) settings.lowCartDeliveryFee = lowCartDeliveryFee;
    if (mediumCartDeliveryFee !== undefined) settings.mediumCartDeliveryFee = mediumCartDeliveryFee;
    if (sameDayChennaiFee !== undefined) settings.sameDayChennaiFee = sameDayChennaiFee;
    if (serviceableCities !== undefined) settings.serviceableCities = serviceableCities;
    if (pickupCoordinates !== undefined) settings.pickupCoordinates = pickupCoordinates;
    if (businessName !== undefined) settings.businessName = businessName;
    if (gstNumber !== undefined) settings.gstNumber = gstNumber;
    if (supportEmail !== undefined) settings.supportEmail = supportEmail;
    if (phone !== undefined) settings.phone = phone;
    if (businessAddress !== undefined) settings.businessAddress = businessAddress;
    if (whatsappNumber !== undefined) settings.whatsappNumber = whatsappNumber;
    if (instagramProfile !== undefined) settings.instagramProfile = instagramProfile;
    if (returnPolicy !== undefined) settings.returnPolicy = returnPolicy;

    await settings.save();

    return NextResponse.json({ success: true, data: settings }, { status: 200 });

  } catch (error) {
    console.error("Settings API PUT Error:", error);
    return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 });
  }
}
