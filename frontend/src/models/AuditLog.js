import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema(
  {
    adminEmail: { type: String, required: true },
    action: { type: String, required: true },
    resourceId: { type: String }, // Optional, id of the affected product/order
    details: { type: Object },
  },
  { timestamps: true }
);

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);

