import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';

/**
 * Fetch products directly from MongoDB for Server Components.
 * This ensures no API hops and avoids localhost fetching issues during build/deployment.
 */

export async function getStorefrontProducts(options = {}) {
  await connectDB();
  
  const query = { $or: [{ status: 'Active' }, { status: { $exists: false } }] };
  
  if (options.category) query.category = options.category;
  if (options.theme) query.theme = options.theme;
  if (options.featured) query.featured = true;
  if (options.bestSeller) query.bestSeller = true;
  if (options.trending) query.trending = true;
  if (options.newArrival) query.newArrival = true;
  if (options.search) {
    query.$or = [
      { title: { $regex: options.search, $options: 'i' } },
      { theme: { $regex: options.search, $options: 'i' } },
      { tags: { $regex: options.search, $options: 'i' } }
    ];
  }
  
  // Find, sort by displayOrder (lowest first), then newest first
  const products = await Product.find(query)
    .sort({ displayOrder: 1, createdAt: -1 })
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
  
  const product = await Product.findOne({ slug, $or: [{ status: 'Active' }, { status: { $exists: false } }] }).lean().exec();
  
  if (!product) return null;
  
  const parsedProduct = JSON.parse(JSON.stringify(product));
  if (parsedProduct.variants && parsedProduct.variants.length > 0) {
    parsedProduct.stock = parsedProduct.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
  }
  return parsedProduct;
}

export async function getRelatedProducts(currentProduct, limit = 4) {
  await connectDB();
  
  const products = await Product.find({ 
    slug: { $ne: currentProduct.slug },
    $or: [{ status: 'Active' }, { status: { $exists: false } }]
  })
    .lean()
    .exec();
    
  const currentTags = currentProduct.tags || [];
  const currentTheme = currentProduct.theme || currentProduct.subcategory;
  const currentPrice = currentProduct.price || 0;

  // Custom sorting function based on priority
  products.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // 1. Same Theme
    const themeA = a.theme || a.subcategory;
    const themeB = b.theme || b.subcategory;
    if (themeA === currentTheme && themeA) scoreA += 100;
    if (themeB === currentTheme && themeB) scoreB += 100;

    // 2. Matching Tags
    const tagsA = a.tags || [];
    const tagsB = b.tags || [];
    const matchTagsA = tagsA.filter(t => currentTags.includes(t)).length;
    const matchTagsB = tagsB.filter(t => currentTags.includes(t)).length;
    scoreA += matchTagsA * 10;
    scoreB += matchTagsB * 10;

    // 3. Same Product Type
    if (a.category === currentProduct.category) scoreA += 5;
    if (b.category === currentProduct.category) scoreB += 5;

    // 4. Similar Price (closer price gets higher score, up to 3 points)
    const priceA = a.price || 0;
    const priceB = b.price || 0;
    const diffA = Math.abs(priceA - currentPrice);
    const diffB = Math.abs(priceB - currentPrice);
    if (diffA < diffB) scoreA += 3;
    else if (diffB < diffA) scoreB += 3;

    return scoreB - scoreA; // Descending order
  });

  const topProducts = products.slice(0, limit);
    
  return JSON.parse(JSON.stringify(topProducts)).map(p => {
    if (p.variants && p.variants.length > 0) {
      p.stock = p.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
      p.price = p.variants[0].price;
      p.salePrice = p.variants[0].salePrice || p.variants[0].price;
    }
    return p;
  });
}
