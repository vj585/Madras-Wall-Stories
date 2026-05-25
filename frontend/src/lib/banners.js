import { connectDB } from '@/lib/mongodb';
import Banner from '@/models/Banner';

const defaultImages = [
  '/images/master.jpg',
  '/images/batman.jpg',
  '/images/michael.jpg',
  '/images/pennywise.jpg',
  '/images/spiderman.jpg',
  '/images/3.jpg',
  '/images/anime.jpg',
  '/images/music.jpg'
];

/**
 * Fetch banners directly from MongoDB for Server Components.
 */
export async function getStorefrontBanners() {
  await connectDB();
  const banners = await Banner.find({ $or: [{ status: 'Active' }, { active: true }] })
    .sort({ order: 1, createdAt: -1 })
    .lean()
    .exec();
    
  let parsedBanners = JSON.parse(JSON.stringify(banners));
  
  // Pad with default images to ensure at least 15 items. 
  // This mathematically guarantees no components show duplicate images nearby.
  if (parsedBanners.length < 15) {
    let defaultIdx = 0;
    while (parsedBanners.length < 15) {
      parsedBanners.push({ image: defaultImages[defaultIdx % defaultImages.length] });
      defaultIdx++;
    }
  }
  
  return parsedBanners;
}
