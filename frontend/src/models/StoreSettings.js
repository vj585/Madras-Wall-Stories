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
    ]
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.StoreSettings || mongoose.model('StoreSettings', StoreSettingsSchema);
