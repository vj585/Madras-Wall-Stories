import mongoose from 'mongoose';

const StoreSettingsSchema = new mongoose.Schema(
  {
    // A singleton document, so we can enforce _id to be a specific string or just always fetch the first document
    singletonId: { type: String, default: 'global_settings', unique: true },
    framePricing: [
      {
        name: { type: String, required: true },
        markup: { type: Number, default: 0, min: 0 }
      }
    ],
    freeShippingThreshold: { type: Number, default: 299 },
    lowCartDeliveryFee: { type: Number, default: 39 },
    deliveryProvider: { type: String, enum: ['Shiprocket'], default: 'Shiprocket' },
    serviceableCities: { type: [String], default: ['Chennai'] },
    pickupCoordinates: {
      latitude: { type: Number, default: 13.0827 }, // Chennai default
      longitude: { type: Number, default: 80.2707 },
    },
    businessName: { type: String, default: 'Madras Wall Stories' },
    gstNumber: { type: String, default: '' },
    supportEmail: { type: String, default: 'support@madraswallstories.com' },
    phone: { type: String, default: '+91 ' },
    businessAddress: { type: String, default: '' },
    whatsappNumber: { type: String, default: '' },
    instagramProfile: { type: String, default: '' },
    returnPolicy: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.StoreSettings || mongoose.model('StoreSettings', StoreSettingsSchema);
