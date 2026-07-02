"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import TiltWrapper from '@/components/ui/TiltWrapper';

// These are the 3 top-level product types that map to `category` in the DB
// The themes inside map to `theme` field in the DB
const productTypes = [
  {
    name: 'Posters',
    // Matches products with category containing "Poster"
    categoryMatch: ['Standard Posters', 'Premium Posters', 'Posters'],
    link: '/posters',
    accent: '#1A365D',
    themes: [
      { name: 'Anime', slug: 'anime' },
      { name: 'Movies', slug: 'movies' },
      { name: 'Marvel', slug: 'marvel' },
      { name: 'Gaming', slug: 'gaming' },
      { name: 'Music', slug: 'music' },
      { name: 'Sports', slug: 'sports' },
      { name: 'Nature', slug: 'nature' },
      { name: 'Quotes', slug: 'quotes' },
    ],
    fallbackImage: '/images/master.jpg',
  },
  {
    name: 'Polaroids',
    categoryMatch: ['Polaroids', 'Standard Polaroid', 'Custom Polaroid'],
    link: '/polaroids',
    accent: '#D4AF37',
    themes: [
      { name: 'Memories', slug: 'memories' },
      { name: 'Aesthetic', slug: 'aesthetic' },
      { name: 'Custom', slug: 'custom' },
    ],
    fallbackImage: '/images/michael.jpg',
  },
  {
    name: 'Stickers',
    categoryMatch: ['Stickers', 'Standard Sticker'],
    link: '/shop?category=stickers',
    accent: '#111111',
    themes: [
      { name: 'Anime', slug: 'sticker-anime' },
      { name: 'Pop Culture', slug: 'pop-culture' },
      { name: 'Minimal', slug: 'minimal' },
    ],
    fallbackImage: '/images/spiderman.jpg',
  },
];

function getProductImage(products, categoryMatches, theme) {
  const match = products.find(p => {
    const catMatch = categoryMatches.some(c =>
      (p.category || '').toLowerCase().includes(c.toLowerCase())
    );
    if (theme) {
      const themeMatch = (p.theme || '').toLowerCase().includes(theme.toLowerCase());
      return catMatch && themeMatch;
    }
    return catMatch;
  });
  return match?.images?.[0] || null;
}

export default function Categories({ products = [] }) {
  return (
    <section className="py-12 md:py-20 bg-white text-foreground overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-end mb-12"
        >
          <div>
            <h2 className="text-3xl md:text-5xl font-heading font-bold mb-3 text-gray-900">
              Curated Collections
            </h2>
            <p className="text-gray-500 max-w-xl text-lg font-light">
              Find the perfect aesthetic for your space or the perfect gift for them.
            </p>
          </div>
          <Link href="/shop" className="text-black font-medium hover:text-accent-blue transition-colors mt-4 md:mt-0 flex items-center gap-1">
            View All <span className="text-xl">→</span>
          </Link>
        </motion.div>

        {/* Three product type groups */}
        <div className="space-y-12 md:space-y-16">
          {productTypes.map((type, typeIdx) => {
            // Find the best image for this type's hero
            const heroImage = getProductImage(products, type.categoryMatch, null) || type.fallbackImage;

            return (
              <motion.div
                key={type.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: typeIdx * 0.1 }}
              >
                {/* Type heading row */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    {/* Gold accent bar */}
                    <span className="block w-1 h-7 rounded-full bg-accent-yellow" />
                    <h3 className="font-heading font-bold text-2xl md:text-3xl text-gray-900">
                      {type.name}
                    </h3>
                  </div>
                  <Link
                    href={type.link}
                    className="text-sm font-medium text-gray-500 hover:text-accent-blue transition-colors flex items-center gap-1"
                  >
                    Shop All <span>→</span>
                  </Link>
                </div>

                {/* Horizontal scroll row: hero card + theme chips */}
                <div className="flex overflow-x-auto pb-4 hide-scrollbar gap-4 snap-x">
                  {/* Hero / Type card */}
                  <Link href={type.link} className="snap-start shrink-0 group w-36 md:w-44">
                    <TiltWrapper className="w-full aspect-[3/4] rounded-2xl overflow-hidden relative shadow-sm border border-gray-100 group-hover:shadow-lg transition-all duration-300">
                      <Image
                        src={heroImage}
                        alt={type.name}
                        fill
                        sizes="(max-width: 768px) 144px, 176px"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {/* Dark overlay with type name */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent z-10 flex items-end p-3">
                        <span className="text-white font-heading font-bold text-sm tracking-wide">
                          {type.name}
                        </span>
                      </div>
                    </TiltWrapper>
                  </Link>

                  {/* Theme chips / sub-category cards */}
                  {type.themes.map((theme, themeIdx) => {
                    const themeImage = getProductImage(products, type.categoryMatch, theme.name) || type.fallbackImage;
                    return (
                      <Link
                        key={theme.slug}
                        href={`/category/${theme.slug}`}
                        className="snap-start shrink-0 group w-36 md:w-44"
                      >
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: themeIdx * 0.05 }}
                          className="flex flex-col gap-3"
                        >
                          <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden relative shadow-sm border border-gray-100 group-hover:shadow-lg transition-all duration-300">
                            <Image
                              src={themeImage}
                              alt={theme.name}
                              fill
                              sizes="(max-width: 768px) 144px, 176px"
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {/* Subtle overlay on hover */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 z-10" />
                          </div>
                          <span className="font-heading font-medium text-sm text-gray-800 group-hover:text-accent-blue transition-colors text-center">
                            {theme.name}
                          </span>
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>

                {/* Thin divider between sections (not after last) */}
                {typeIdx < productTypes.length - 1 && (
                  <div className="mt-10 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
