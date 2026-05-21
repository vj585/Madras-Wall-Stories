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
    price: {
      type: Number,
      required: [true, 'Please provide a product price'],
      min: 0,
    },
    salePrice: {
      type: Number,
      min: 0,
    },
    category: {
      type: String,
      required: [true, 'Please provide a product category'],
    },
    subcategory: {
      type: String,
    },
    images: {
      type: [String],
      default: [],
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
      required: [true, 'Please provide product stock quantity'],
      min: 0,
      default: 0,
    },
    featured: {
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
      enum: ['Active', 'Draft', 'Hidden'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
