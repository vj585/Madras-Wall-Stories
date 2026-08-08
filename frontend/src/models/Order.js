import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        title: String,
        price: Number, // Legacy
        unitPrice: Number,
        lineTotal: Number,
        quantity: {
          type: Number,
          default: 1,
        },
        size: String,
        frame: String,
        image: String,
        isCustom: {
          type: Boolean,
          default: false,
        },
        customDetails: {
          finish: String,
          caption: String,
        }
      }
    ],
    amount: {
      type: Number,
      required: true,
    },
    subtotal: {
      type: Number,
    },
    shipping: {
      type: Number,
    },
    grandTotal: {
      type: Number,
    },
    freeShippingApplied: {
      type: Boolean,
      default: false,
    },
    shippingAddress: {
      firstName: String,
      lastName: String,
      address1: String,
      address2: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },
    addressSnapshot: {
      fullName: String,
      phone: String,
      houseOrApartment: String,
      street: String,
      areaOrLocality: String,
      landmark: String,
      city: String,
      state: String,
      pincode: String,
      addressType: String
    },
    paymentMethod: {
      type: String,
      enum: ['Razorpay', 'COD'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
    },
    refundStatus: {
      type: String,
      enum: ['None', 'Refund Required', 'Refund Initiated', 'Refund Completed'],
      default: 'None',
    },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Processing', 'Printing', 'Printed', 'Quality Check', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    shippingStatus: {
      type: String,
      enum: ['Pending', 'Packing Started', 'Quality Check', 'Packed', 'Ready For Pickup', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    statusTimeline: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now }
      }
    ],
    razorpayOrderId: {
      type: String,
      unique: true,
      sparse: true,
    },
    razorpayPaymentId: {
      type: String,
      unique: true,
      sparse: true,
    },
    paymentTimestamp: {
      type: Date,
    },
    coupon: {
      type: String,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    trackingNumber: {
      type: String,
    },
    trackingUrl: {
      type: String,
    },
    dispatchDate: {
      type: Date,
    },
    shippingNotes: {
      type: String,
    },
    courierName: {
      type: String,
    },
    courierCharge: {
      type: Number,
    },
    packageWeight: {
      type: Number,
    },
    deliveryPartner: {
      type: String,
      default: 'Standard',
    },
    deliveryMode: {
      type: String,
      enum: ['Standard', 'Same Day'],
    },
    estimatedDelivery: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);

