import mongoose from 'mongoose';

const CustomPrintSchema = new mongoose.Schema(
  {
    uploadedImage: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      trim: true,
    },
    size: {
      type: String,
      required: true,
    },
    frame: {
      type: String,
    },
    finish: {
      type: String,
    },
    customerName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Reviewed', 'Printing', 'Shipped'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.CustomPrint || mongoose.model('CustomPrint', CustomPrintSchema);

