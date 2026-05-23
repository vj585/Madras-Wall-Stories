import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      // Optional because Google OAuth users won't have a password
    },
    role: {
      type: String,
      enum: ['customer'],
      default: 'customer',
    },
    authProvider: {
      type: String,
      enum: ['email', 'google'],
      required: true,
      default: 'email',
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
    },
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
      }
    ],
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Assuming wishlist references Products
      }
    ],
    savedAddresses: [
      {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        houseOrApartment: { type: String, required: true },
        street: { type: String, required: true },
        areaOrLocality: String,
        landmark: String,
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        addressType: { type: String, enum: ['Home', 'Work', 'Other'], default: 'Home' }
      }
    ],
    defaultAddress: {
      type: mongoose.Schema.Types.ObjectId, // Will point to an _id within savedAddresses
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
