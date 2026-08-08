import mongoose from 'mongoose';

const AdminOTPSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    otp: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      enum: ['ADD_ADMIN', 'REMOVE_ADMIN'],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: '0s' } // Auto-delete document upon expiration
    }
  },
  { timestamps: true }
);

export default mongoose.models.AdminOTP || mongoose.model('AdminOTP', AdminOTPSchema);

