import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a product title'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Please provide a product slug'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
    },
    shortDescription: {
      type: String,
      maxLength: 250,
    },
    category: {
      type: String,
      required: [true, 'Please provide a product category'],
    },
    theme: {
      type: String,
    },
    subcategory: {
      type: String,
    },
    images: {
      type: [String],
      default: [],
    },
    // --- DEPRECATED FIELDS (Keep for legacy support, but no longer required) ---
    price: {
      type: Number,
      min: 0,
    },
    salePrice: {
      type: Number,
      min: 0,
    },
    sizes: {
      type: [String],
      default: [],
    },
    frameOptions: {
      type: [String],
      default: [],
    },
    stock: {
      type: Number,
      min: 0,
      default: 0,
    },
    // ----------------------------------------------------------------------------
    
    // --- NEW VARIANTS ARCHITECTURE ---
    variants: [
      {
        size: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        salePrice: { type: Number, min: 0 },
        costPrice: { type: Number, min: 0 },
        stock: { type: Number, default: 0, min: 0 },
        gst: { type: Number, default: 18 },
        frames: { type: [String], default: [] },
        enabled: { type: Boolean, default: true }
      }
    ],

    featured: {
      type: Boolean,
      default: false,
    },
    bestSeller: {
      type: Boolean,
      default: false,
    },
    trending: {
      type: Boolean,
      default: false,
    },
    newArrival: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    orientation: {
      type: String,
      enum: ['Portrait', 'Landscape', 'Square'],
    },
    printFinish: {
      type: String,
      enum: ['Matte', 'Glossy', 'Silk'],
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Draft', 'Hidden'],
      default: 'Active',
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);

