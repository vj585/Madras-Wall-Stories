export function getUniqueBanners(banners = [], requestedIndices = [], fallbacks = []) {
  // 1. Deduplicate incoming banners based on image URL
  const uniqueBanners = [];
  const seen = new Set();
  
  for (const b of banners) {
    if (b && b.image && !seen.has(b.image)) {
      seen.add(b.image);
      uniqueBanners.push(b);
    }
  }

  // 2. Ensure we have enough banners in the pool to prevent duplicates for the requested count.
  const pool = [...uniqueBanners];
  const count = requestedIndices.length;
  
  let fallbackIndex = 0;
  while (pool.length < count && fallbacks.length > 0) {
    const f = fallbacks[fallbackIndex % fallbacks.length];
    if (!seen.has(f)) {
      seen.add(f);
      pool.push({ image: f });
    }
    fallbackIndex++;
    if (fallbackIndex > fallbacks.length * 2) break; // prevent infinite loops if fallbacks are also few
  }

  // If pool is still empty, add a hardcoded generic placeholder
  if (pool.length === 0) {
    pool.push({ image: '/placeholder.jpg' });
  }

  // 3. Resolve requested indices into unique banners
  const result = [];
  const currentlyUsed = new Set();

  for (let i = 0; i < count; i++) {
    const requestedIdx = requestedIndices[i];
    let target = requestedIdx % pool.length;
    
    // Resolve collision
    let attempts = 0;
    while (currentlyUsed.has(pool[target].image) && attempts < pool.length) {
      target = (target + 1) % pool.length;
      attempts++;
    }

    const selectedBanner = pool[target];
    result.push(selectedBanner);
    
    // Mark as used. If we've used all available banners, clear the used set so we can reuse them,
    // but keep the IMMEDIATE PREVIOUS banner in the set to avoid side-by-side duplicates.
    currentlyUsed.add(selectedBanner.image);
    
    if (currentlyUsed.size >= pool.length) {
      currentlyUsed.clear();
      // Retain the last used image to prevent side-by-side duplicates when wrapping
      currentlyUsed.add(selectedBanner.image); 
    }
  }

  return result;
}

