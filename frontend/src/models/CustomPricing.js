import mongoose from 'mongoose';

const CustomPricingSchema = new mongoose.Schema(
  {
    basePrices: {
      Poster: { type: Number, default: 99 },
      Polaroid: { type: Number, default: 49 },
      'Mini Prints': { type: Number, default: 39 },
      'Photo Booth Strip': { type: Number, default: 29 },
    },
    sizes: {
      'A5 (6x8")': { type: Number, default: 0 },
      'A4 (8x12")': { type: Number, default: 0 },
      'A3 (12x18")': { type: Number, default: 10 },
      'A2 (16x24")': { type: Number, default: 20 },
      'Standard (3,5x4,2")': { type: Number, default: 0 },
      'Mini (2,1x3,4")': { type: Number, default: 0 },
      'Square (4x4")': { type: Number, default: 0 },
      'Landscape (4x6")': { type: Number, default: 0 },
      'Standard (2x6")': { type: Number, default: 0 },
    },
    frames: {
      'No Frame': { type: Number, default: 0 },
      'Black Frame': { type: Number, default: 50 },
      'White Frame': { type: Number, default: 50 },
      'Wooden Frame': { type: Number, default: 100 },
    },
    finishes: {
      'Matte': { type: Number, default: 0 },
      'Glossy': { type: Number, default: 10 },
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.CustomPricing || mongoose.model('CustomPricing', CustomPricingSchema);
