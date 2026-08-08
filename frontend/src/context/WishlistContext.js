"use client";
import { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem('mws_wishlist');
      if (savedWishlist) {
        setWishlistItems(JSON.parse(savedWishlist));
      }
    } catch (e) {}
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem('mws_wishlist', JSON.stringify(wishlistItems));
    } catch (e) {}
  }, [wishlistItems, mounted]);

  const toggleWishlist = (product) => {
    setWishlistItems(prev => {
      const exists = prev.some(item => item.slug === product.slug);
      if (exists) {
        return prev.filter(item => item.slug !== product.slug);
      }
      return [...prev, product];
    });
  };

  const removeFromWishlist = (slug) => {
    setWishlistItems(prev => prev.filter(item => item.slug !== slug));
  };

  const isInWishlist = (slug) => {
    return wishlistItems.some(item => item.slug === slug);
  };

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      toggleWishlist,
      removeFromWishlist,
      isInWishlist,
      mounted
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}

