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
  return JSON.parse(JSON.stringify(products)).map(p => {
    if (p.variants && p.variants.length > 0) {
      p.stock = p.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
      p.price = p.variants[0].price;
      p.salePrice = p.variants[0].salePrice || p.variants[0].price;
    }
    return p;
  });
}

export async function getProductBySlug(slug) {
  await connectDB();
  
  const product = await Product.findOne({ slug, status: 'Active' }).lean().exec();
  
  if (!product) return null;
  
  const parsedProduct = JSON.parse(JSON.stringify(product));
  if (parsedProduct.variants && parsedProduct.variants.length > 0) {
    parsedProduct.stock = parsedProduct.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
  }
  return parsedProduct;
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
    
  return JSON.parse(JSON.stringify(products)).map(p => {
    if (p.variants && p.variants.length > 0) {
      p.stock = p.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
      p.price = p.variants[0].price;
      p.salePrice = p.variants[0].salePrice || p.variants[0].price;
    }
    return p;
  });
}
