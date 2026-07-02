"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import TiltWrapper from '@/components/ui/TiltWrapper';

const categories = [
  { name: 'Anime', fallbackImage: '/images/master.jpg', link: '/category/anime' },
  { name: 'Marvel', fallbackImage: '/images/batman.jpg', link: '/category/marvel' },
  { name: 'Movies', fallbackImage: '/images/pennywise.jpg', link: '/category/movies' },
  { name: 'Gaming', fallbackImage: '/images/spiderman.jpg', link: '/category/gaming' },
  { name: 'Cars', fallbackImage: '/images/batman.jpg', link: '/category/cars' },
  { name: 'Music', fallbackImage: '/images/michael.jpg', link: '/category/music' },
  { name: 'Nature', fallbackImage: '/images/master.jpg', link: '/category/nature' },
  { name: 'Quotes', fallbackImage: '/images/master.jpg', link: '/category/quotes' },
  { name: 'Sports', fallbackImage: '/images/batman.jpg', link: '/category/sports' },
  { name: 'Travel', fallbackImage: '/images/master.jpg', link: '/category/travel' },
];

export default function Categories({ products = [] }) {
  return (
    <section className="py-12 md:py-20 bg-white text-foreground overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-end mb-16"
        >
          <div>
            <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4 text-gray-900">Curated Collections</h2>
            <p className="text-gray-500 max-w-xl text-lg font-light">Find the perfect aesthetic for your space or the perfect gift for them.</p>
          </div>
          <Link href="/shop" className="text-black font-medium hover:text-accent-blue transition-colors mt-4 md:mt-0 flex items-center gap-1">
            View All <span className="text-xl">→</span>
          </Link>
        </motion.div>

        <div className="flex overflow-x-auto pb-8 hide-scrollbar gap-8 snap-x">
          {categories.map((cat, idx) => {
            // Find a product that matches this category to use as thumbnail
            const categoryProduct = products.find(p => {
              const theme = p.theme || p.category || '';
              return theme.toLowerCase().includes(cat.name.toLowerCase()) || 
                     cat.name.toLowerCase().includes(theme.toLowerCase());
            });
            const imageSrc = (categoryProduct?.images && categoryProduct.images.length > 0) ? categoryProduct.images[0] : cat.fallbackImage;

            return (
            <Link key={cat.name} href={cat.link} className="snap-start shrink-0 group">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex flex-col items-center gap-6"
              >
                <TiltWrapper className="w-40 h-40 md:w-56 md:h-56 rounded-[2.5rem] overflow-hidden relative border border-gray-100 transition-all duration-500 shadow-sm group-hover:shadow-xl">
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors z-10"></div>
                  <Image 
                    src={imageSrc} 
                    alt={cat.name} 
                    fill
                    sizes="(max-width: 768px) 160px, 224px"
                    className="object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                </TiltWrapper>
                <h3 className="font-heading font-semibold text-lg md:text-xl text-gray-800 group-hover:text-accent-blue transition-colors">
                  {cat.name}
                </h3>
              </motion.div>
            </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
