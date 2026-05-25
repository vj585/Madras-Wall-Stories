import { connectDB } from '@/lib/mongodb';
import Banner from '@/models/Banner';

/**
 * Fetch banners directly from MongoDB for Server Components.
 */
export async function getStorefrontBanners() {
  await connectDB();
  const banners = await Banner.find({ $or: [{ status: 'Active' }, { active: true }] })
    .sort({ order: 1, createdAt: -1 })
    .lean()
    .exec();
    
  // Convert _id to string for Next.js Client Component props serialization
  return JSON.parse(JSON.stringify(banners));
}
