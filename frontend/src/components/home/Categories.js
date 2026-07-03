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
    categoryMatch: ['standard posters', 'premium posters', 'posters'],
    link: '/posters',
    fallbackImage: '/images/master.jpg',
    themes: [
      { name: 'Anime', slug: 'anime', fallbackImage: '/images/master.jpg' },
      { name: 'Movies', slug: 'movies', fallbackImage: '/images/pennywise.jpg' },
      { name: 'Marvel', slug: 'marvel', fallbackImage: '/images/batman.jpg' },
      { name: 'Gaming', slug: 'gaming', fallbackImage: '/images/spiderman.jpg' },
      { name: 'Music', slug: 'music', fallbackImage: '/images/michael.jpg' },
      { name: 'Sports', slug: 'sports', fallbackImage: '/images/batman.jpg' },
      { name: 'Nature', slug: 'nature', fallbackImage: '/images/master.jpg' },
      { name: 'Quotes', slug: 'quotes', fallbackImage: '/images/master.jpg' },
    ],
  },
  {
    name: 'Polaroids',
    categoryMatch: ['polaroids', 'standard polaroid', 'custom polaroid'],
    link: '/polaroids',
    fallbackImage: '/images/michael.jpg',
    themes: [
      { name: 'Memories', slug: 'memories', fallbackImage: '/images/spiderman.jpg' },
      { name: 'Aesthetic', slug: 'aesthetic', fallbackImage: '/images/master.jpg' },
      { name: 'Custom', slug: 'custom', fallbackImage: '/images/pennywise.jpg' },
    ],
  },
  {
    name: 'Stickers',
    categoryMatch: ['stickers', 'standard sticker'],
    link: '/shop?category=stickers',
    fallbackImage: '/images/spiderman.jpg',
    themes: [
      { name: 'Anime', slug: 'sticker-anime', fallbackImage: '/images/master.jpg' },
      { name: 'Pop Culture', slug: 'pop-culture', fallbackImage: '/images/batman.jpg' },
      { name: 'Minimal', slug: 'minimal', fallbackImage: '/images/michael.jpg' },
    ],
  },
];

/**
 * For HERO card: finds any product in this category
 */
function resolveHeroImage(products, categoryMatches, fallbackImage) {
  const catLower = categoryMatches.map(c => c.toLowerCase());
  const match = products.find(p =>
    catLower.some(c => (p.category || '').toLowerCase().includes(c)) &&
    p.images?.[0]
  );
  return match?.images?.[0] || fallbackImage;
}

/**
 * For THEME cards: only returns an image if a product specifically
 * matches that theme (with or without category constraint).
 * Returns null if no theme-specific product exists → "Coming Soon" tile shown.
 */
function resolveThemeImage(products, categoryMatches, themeName, fallbackImage) {
  const catLower = categoryMatches.map(c => c.toLowerCase());
  const themeLower = themeName.toLowerCase();

  // Level 1: category + theme match
  const exact = products.find(p =>
    catLower.some(c => (p.category || '').toLowerCase().includes(c)) &&
    (p.theme || '').toLowerCase().includes(themeLower) &&
    p.images?.[0]
  );
  if (exact?.images?.[0]) return exact.images[0];

  // Level 2: theme match in any category (e.g. product tagged "Anime" under any type)
  const themeOnly = products.find(p =>
    (p.theme || '').toLowerCase().includes(themeLower) &&
    p.images?.[0]
  );
  if (themeOnly?.images?.[0]) return themeOnly.images[0];

  // Level 3 (Legacy Support): Old products stored the theme name in the category field itself
  const legacyCategory = products.find(p =>
    (p.category || '').toLowerCase().includes(themeLower) &&
    p.images?.[0]
  );
  if (legacyCategory?.images?.[0]) return legacyCategory.images[0];

  // No match → return fallback so the original images are shown
  return fallbackImage;
}

function CategoryCard({ href, image, label, delay = 0, isHero = false, designType = 'posters' }) {
  const hasImage = !!image;

  // Visual styles based on designType
  const isPolaroid = designType === 'polaroids';
  const isSticker = designType === 'stickers';

  let tiltClasses = "w-full relative shadow-sm transition-all duration-300 group-hover:shadow-lg ";
  let imageContainerClasses = "relative ";

  if (isPolaroid) {
    // Polaroid design: warm cream background, thick bottom padding, slight rotation
    tiltClasses += "bg-[#fdf8f0] p-2 pb-10 md:p-3 md:pb-12 hover:-translate-y-2 group-hover:rotate-0 border border-[#e8dcc8] " + (isHero ? "rotate-[-2deg]" : "rotate-[2deg]");
    imageContainerClasses += "w-full aspect-[4/5] bg-[#e8dcc8] ";
  } else if (isSticker) {
    // Sticker design: soft lavender-tinted background, thick border, rounded die-cut shape
    tiltClasses += "bg-[#f0eeff] rounded-3xl p-2 hover:-translate-y-2 border-2 border-[#c9c0f0] drop-shadow-md ";
    imageContainerClasses += "w-full aspect-[3/4] bg-[#e2ddf8] rounded-[1.25rem] overflow-hidden ";
  } else {
    // Posters design: default edge-to-edge
    tiltClasses += "rounded-2xl overflow-hidden border border-gray-100 aspect-[3/4] ";
    imageContainerClasses += "w-full h-full bg-gray-50 ";
  }

  return (
    <Link href={href} className="snap-start shrink-0 group w-36 md:w-44">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay }}
        className="flex flex-col gap-3"
      >
        <TiltWrapper className={tiltClasses}>
          <div className={imageContainerClasses}>
            {hasImage ? (
              <Image
                src={image}
                alt={label}
                fill
                sizes="(max-width: 768px) 144px, 176px"
                className={`object-cover transition-transform duration-700 group-hover:scale-105`}
              />
            ) : (
              // Placeholder state
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-50 flex flex-col items-center justify-center gap-2 p-3">
                <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-[10px] text-gray-400 text-center font-medium leading-tight">Coming Soon</span>
              </div>
            )}
          </div>

          {/* On hero card: overlay with type name (only for posters and stickers) */}
          {isHero && hasImage && !isPolaroid && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent z-10 flex items-end p-3 pointer-events-none rounded-[inherit]">
              <span className="text-white font-heading font-bold text-sm tracking-wide">{label}</span>
            </div>
          )}

          {/* Polaroid label is placed on the white border itself */}
          {isPolaroid && (
            <div className="absolute bottom-2 md:bottom-3 left-0 right-0 text-center pointer-events-none">
              <span className="text-gray-800 font-medium text-sm tracking-wide">{label}</span>
            </div>
          )}

          {/* Subtle hover overlay */}
          {!isHero && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 z-10 pointer-events-none rounded-[inherit]" />
          )}
        </TiltWrapper>

        {/* Labels underneath for Posters and Stickers */}
        {(!isHero && !isPolaroid) && (
          <span className="font-heading font-medium text-sm text-gray-800 group-hover:text-accent-blue transition-colors text-center">
            {label}
          </span>
        )}
      </motion.div>
    </Link>
  );
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
            const heroImage = resolveHeroImage(products, type.categoryMatch, type.fallbackImage);

            const isPolaroidRow = type.name === 'Polaroids';
            const isStickerRow = type.name === 'Stickers';
            const rowBg = isPolaroidRow
              ? 'bg-gradient-to-r from-[#fdf5e6] via-[#fdf8f0] to-[#fef9ef]'
              : isStickerRow
              ? 'bg-gradient-to-r from-[#f3f0ff] via-[#ede8ff] to-[#f0eeff]'
              : '';

            return (
              <motion.div
                key={type.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: typeIdx * 0.1 }}
                className={`${rowBg ? rowBg + ' -mx-4 px-4 py-6 rounded-3xl' : ''}`}
              >
                {/* Type heading row */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className={`block w-1 h-7 rounded-full ${isPolaroidRow ? 'bg-[#c8a96e]' : isStickerRow ? 'bg-[#7c6fcd]' : 'bg-accent-yellow'}`} />
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

                {/* Horizontal scroll row */}
                <div className="flex overflow-x-auto pb-6 pt-4 px-2 -mx-2 hide-scrollbar gap-4 snap-x">
                  {/* Hero / Type card */}
                  <CategoryCard
                    href={type.link}
                    image={heroImage}
                    label={type.name}
                    delay={0}
                    isHero
                    designType={type.name.toLowerCase()}
                  />

                  {/* Theme sub-category cards */}
                  {type.themes.map((theme, themeIdx) => {
                    const themeImage = resolveThemeImage(products, type.categoryMatch, theme.name, theme.fallbackImage);
                    return (
                      <CategoryCard
                        key={theme.slug}
                        href={`/category/${theme.slug}`}
                        image={themeImage}
                        label={theme.name}
                        delay={themeIdx * 0.05 + 0.05}
                        isHero={false}
                        designType={type.name.toLowerCase()}
                      />
                    );
                  })}
                </div>

                {/* Divider between groups */}
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
