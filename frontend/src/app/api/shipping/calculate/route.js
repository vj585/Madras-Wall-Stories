import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/mongodb";
import StoreSettings from "@/models/StoreSettings";
import { calculateDelivery } from "@/lib/porter";

export async function POST(request) {
  try {
    const { cartTotal, city, destinationCoords } = await request.json();

    if (cartTotal === undefined) {
      return NextResponse.json({ success: false, error: 'Cart total is required' }, { status: 400 });
    }

    await connectDB();
    const settings = await StoreSettings.findOne({ singletonId: 'global_settings' });
    
    if (!settings) {
      return NextResponse.json({ success: false, error: 'Store settings not found' }, { status: 500 });
    }

    // 1. Calculate Standard Shipping
    let standardFee = 0;
    if (cartTotal >= settings.freeShippingThreshold) {
      standardFee = 0;
    } else if (cartTotal >= 299 && cartTotal < 599) {
      // Assuming 599 is the freeShippingThreshold
      standardFee = settings.mediumCartDeliveryFee;
    } else {
      standardFee = settings.lowCartDeliveryFee;
    }

    // Adjust generic logic if thresholds change
    if (cartTotal < 299) standardFee = settings.lowCartDeliveryFee;
    else if (cartTotal >= 299 && cartTotal < settings.freeShippingThreshold) standardFee = settings.mediumCartDeliveryFee;
    else standardFee = 0;

    const response = {
      success: true,
      standard: {
        available: true,
        fee: standardFee,
        partner: 'Shiprocket',
        estimatedDays: '3-5 Business Days'
      },
      sameDay: {
        available: false,
        fee: 0,
        partner: 'Porter'
      }
    };

    // 2. Check if Same Day is available (City matches serviceableCities)
    const isServiceable = city && settings.serviceableCities.some(
      c => c.toLowerCase() === city.toLowerCase()
    );

    if (isServiceable) {
      // Calculate dynamic Porter cost
      try {
        const porterRes = await calculateDelivery(
          settings.pickupCoordinates,
          destinationCoords // Optional for mock
        );

        if (porterRes.success) {
          const actualCost = porterRes.actualCost;
          // Rule: If actual <= base fee, customer pays base fee. Else customer pays actual cost.
          const finalSameDayFee = actualCost <= settings.sameDayChennaiFee ? settings.sameDayChennaiFee : actualCost;
          
          response.sameDay = {
            available: true,
            fee: finalSameDayFee,
            partner: 'Porter'
          };
        }
      } catch (err) {
        console.error("Porter calculation failed, falling back to standard delivery:", err);
        // Delivery Failure Fallback: Hide Same Day
      }
    }

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error("Shipping calculate API Error:", error);
    return NextResponse.json({ success: false, error: 'Failed to calculate shipping' }, { status: 500 });
  }
}
