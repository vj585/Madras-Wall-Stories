"use client";
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getUniqueBanners } from '@/utils/bannerUtils';

const layoutHeights = ['h-64', 'h-96', 'h-72', 'h-80', 'h-64', 'h-96'];

export default function Inspiration({ banners = [] }) {
  const [offset, setOffset] = useState(8);

  useEffect(() => {
    if (banners.length === 0) return;
    
    // Cycle the entire masonry grid slowly
    const interval = setInterval(() => {
      setOffset(prev => (prev + 1) % banners.length);
    }, 12000);

    return () => clearInterval(interval);
  }, [banners.length]);

  // Construct items matching the required layout heights
  const requestedIndices = layoutHeights.map((_, i) => offset + i);
  const fallbacks = ['/images/master.jpg', '/images/spiderman.jpg', '/images/pennywise.jpg'];
  const uniqueImages = getUniqueBanners(banners, requestedIndices, fallbacks);

  const items = layoutHeights.map((height, i) => ({
    id: i,
    image: uniqueImages[i]?.image,
    height
  }));

  return (
    <section className="py-24 bg-surface text-foreground overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4 text-gray-900">Style Inspiration</h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg font-light">
            See how our community is styling their spaces. Tag us <span className="text-accent-blue font-semibold">@madras.wall</span> to get featured.
          </p>
        </motion.div>

        {/* Masonry Layout approximation */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {items.map((item, idx) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="break-inside-avoid relative group rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-shadow duration-300 will-change-transform"
            >
              <div className={`relative w-full ${item.height}`}>
                <Image 
                  src={item.image} 
                  alt="Aesthetic Room Inspiration" 
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                <Link href="/shop" className="bg-white text-black px-8 py-3 rounded-full font-semibold shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-gray-50">
                  Shop the Look
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
