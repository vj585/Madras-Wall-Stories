import mongoose from 'mongoose';

const VerificationTokenSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    token: {
      type: String, // Store hashed version in DB, send unhashed version in email
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: '0s' } // Automatically delete the document when expiresAt is reached
    }
  },
  { timestamps: true }
);

export default mongoose.models.VerificationToken || mongoose.model('VerificationToken', VerificationTokenSchema);

