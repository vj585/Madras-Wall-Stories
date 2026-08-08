/**
 * Utility functions for products that can be safely used in both 
 * Server and Client components without pulling in Node.js dependencies like Mongoose.
 */

export function getProductDesignType(product) {
  const cat = (product.category || '').toLowerCase();
  
  // 1. Explicit Category matching
  if (cat.includes('sticker')) return 'stickers';
  if (cat.includes('polaroid')) return 'polaroids';
  if (cat.includes('poster')) return 'posters';
  
  // 2. Legacy / Fallback matching based on sizes
  const sizes = [
    ...(product.variants?.map(v => v.size?.toLowerCase()) || []),
    ...(product.sizes?.map(s => s.toLowerCase()) || [])
  ];
  
  const hasStickerSize = sizes.some(s => s.includes('3x3') || s.includes('4x4') || s.includes('5x5'));
  if (hasStickerSize) return 'stickers';
  
  const hasPolaroidSize = sizes.some(s => s.includes('3.5x4.2') || s.includes('2.1x3.4') || s === 'standard' || s === 'mini');
  if (hasPolaroidSize) return 'polaroids';
  
  // 3. Default fallback
  return 'posters';
}

