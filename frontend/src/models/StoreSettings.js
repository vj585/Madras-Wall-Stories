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
    freeShippingThreshold: { type: Number, default: 599 },
    lowCartDeliveryFee: { type: Number, default: 49 },
    mediumCartDeliveryFee: { type: Number, default: 29 },
    sameDayChennaiFee: { type: Number, default: 99 },
    serviceableCities: { type: [String], default: ['Chennai'] },
    pickupCoordinates: {
      latitude: { type: Number, default: 13.0827 }, // Chennai default
      longitude: { type: Number, default: 80.2707 },
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.StoreSettings || mongoose.model('StoreSettings', StoreSettingsSchema);
