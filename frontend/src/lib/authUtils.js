import AdminUser from '@/models/AdminUser';
import { connectDB } from '@/lib/mongodb';

/**
 * Ensures that the system always has at least one admin.
 * Throws an error if the operation would result in 0 admins.
 */
export async function ensureAdminNotLocked(userIdToDelete) {
  await connectDB();
  const adminCount = await AdminUser.countDocuments({ role: 'ADMIN' });
  
  if (adminCount <= 1) {
    const lastAdmin = await AdminUser.findOne({ role: 'ADMIN' });
    if (lastAdmin && lastAdmin._id.toString() === userIdToDelete) {
      throw new Error("ADMIN_LOCKOUT_PROTECTION: Cannot delete the last remaining admin account.");
    }
  }
}

