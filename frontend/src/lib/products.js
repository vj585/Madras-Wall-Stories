import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';

/**
 * Fetch products directly from MongoDB for Server Components.
 * This ensures no API hops and avoids localhost fetching issues during build/deployment.
 */

export async function getStorefrontProducts(options = {}) {
  await connectDB();
  
  const query = { status: 'Active' };
  
  if (options.category) {
    query.category = options.category;
  }
  
  // Find, sort by newest first, and lean for serialization
  const products = await Product.find(query)
    .sort({ createdAt: -1 })
    .lean()
    .exec();
    
  // Convert _id to string for Next.js Client Component props serialization
  return products.map(p => ({
    ...p,
    _id: p._id.toString(),
    createdAt: p.createdAt ? p.createdAt.toISOString() : null,
    updatedAt: p.updatedAt ? p.updatedAt.toISOString() : null,
  }));
}

export async function getProductBySlug(slug) {
  await connectDB();
  
  const product = await Product.findOne({ slug, status: 'Active' }).lean().exec();
  
  if (!product) return null;
  
  return {
    ...product,
    _id: product._id.toString(),
    createdAt: product.createdAt ? product.createdAt.toISOString() : null,
    updatedAt: product.updatedAt ? product.updatedAt.toISOString() : null,
  };
}

export async function getRelatedProducts(currentSlug, category, limit = 4) {
  await connectDB();
  
  const products = await Product.find({ 
    category, 
    slug: { $ne: currentSlug },
    status: 'Active'
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()
    .exec();
    
  return products.map(p => ({
    ...p,
    _id: p._id.toString(),
    createdAt: p.createdAt ? p.createdAt.toISOString() : null,
    updatedAt: p.updatedAt ? p.updatedAt.toISOString() : null,
  }));
}
