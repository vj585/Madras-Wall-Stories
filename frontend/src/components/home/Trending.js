"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Star, PackageOpen } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useWishlist } from '@/context/WishlistContext';
import TiltWrapper from '@/components/ui/TiltWrapper';

export default React.memo(function Trending({ products = [] }) {
  const { wishlistItems, toggleWishlist, isInWishlist } = useWishlist();
  
  // Show first 4 products from the central store
  const displayProducts = products.slice(0, 4);

  const handleWishlist = (e, product) => {
    e.preventDefault();
    toggleWishlist(product);
  };

  return (
    <section className="py-12 md:py-20 bg-surface-alt text-foreground">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-end mb-16"
        >
          <div>
            <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4 text-gray-900">Current Favorites</h2>
            <p className="text-gray-500 max-w-xl text-lg font-light">The pieces everyone is using to style their rooms right now.</p>
          </div>
          <Link href="/" className="text-black font-medium hover:text-accent-blue transition-colors mt-4 md:mt-0 flex items-center gap-1">
            Shop All <span className="text-xl">→</span>
          </Link>
        </motion.div>

        {displayProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <PackageOpen className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">New stories are arriving soon</h3>
            <p className="text-gray-500 text-center max-w-sm">We are currently curating our collection. Check back soon for premium prints.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {displayProducts.map((product, idx) => (
              <motion.div
                key={product.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative h-full will-change-transform"
              >
                <TiltWrapper className="w-full h-full flex flex-col bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
                  {product.stock <= 0 ? (
                    <div className="absolute top-3 left-3 z-10 bg-black/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">
                      Out of Stock
                    </div>
                  ) : product.featured && (
                    <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-md text-black text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">
                      Featured
                    </div>
                  )}
                  <button 
                    onClick={(e) => handleWishlist(e, product)}
                    className={`absolute top-3 right-3 z-10 p-2 backdrop-blur-md rounded-full transition-all translate-y-2 group-hover:translate-y-0 ${
                      isInWishlist(product.slug) 
                        ? 'text-red-500 bg-white opacity-100' 
                        : 'text-gray-600 bg-white/50 hover:text-red-500 hover:bg-white opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isInWishlist(product.slug) ? 'fill-current' : ''}`} />
                  </button>
                  <Link href={`/product/${product.slug}`} className="block w-full h-full">
                    <Image
                      src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.jpg'}
                      alt={product.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1200px) 25vw, 25vw"
                      className={`object-cover transform group-hover:scale-105 transition-transform duration-700 ${product.stock <= 0 ? 'opacity-50 grayscale' : ''}`}
                    />
                  </Link>

                  {/* Quick Add */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <Link
                      href={`/product/${product.slug}`}
                      className="w-full bg-black/90 backdrop-blur-md hover:bg-black text-white font-medium py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-colors text-sm"
                    >
                      <ShoppingBag className="w-4 h-4" /> View Product
                    </Link>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center gap-1 mb-2 text-accent-yellow">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="text-xs font-medium text-gray-700">{product.rating || 5.0}</span>
                  </div>
                  <Link href={`/product/${product.slug}`}>
                    <h3 className="font-heading font-medium text-sm md:text-base mb-1 line-clamp-1 group-hover:text-accent-blue transition-colors text-gray-900">{product.title}</h3>
                  </Link>
                  <p className="text-[11px] text-gray-400 mb-3 font-light uppercase tracking-wider">{product.category}</p>
                  <div className="mt-auto flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-lg text-gray-900">₹{product.salePrice || product.price}</span>
                    {product.salePrice && <span className="text-sm text-gray-400 line-through">₹{product.price}</span>}
                  </div>
                </TiltWrapper>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
});
