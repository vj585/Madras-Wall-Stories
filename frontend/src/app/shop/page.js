import Link from 'next/link';
import { getStorefrontProducts } from '@/lib/products';
import Image from 'next/image';
import { PackageOpen } from 'lucide-react';
import TiltWrapper from '@/components/ui/TiltWrapper';

export const dynamic = 'force-dynamic';

// Category groups synced to DB values (AddProductDrawer categoryOptions)
const CATEGORY_FILTERS = {
  posters: ['standard posters', 'premium posters', 'posters'],
  polaroids: ['polaroids', 'standard polaroid', 'custom polaroid'],
  stickers: ['stickers', 'standard sticker'],
};

const FILTER_TABS = [
  { label: 'All', value: '' },
  { label: 'Posters', value: 'posters' },
  { label: 'Polaroids', value: 'polaroids' },
  { label: 'Stickers', value: 'stickers' },
];

export default async function ShopPage({ searchParams }) {
  const resolved = await searchParams;
  const activeFilter = (resolved?.category || '').toLowerCase();
  const allProducts = await getStorefrontProducts();

  const products = activeFilter && CATEGORY_FILTERS[activeFilter]
    ? allProducts.filter(p =>
        CATEGORY_FILTERS[activeFilter].some(cat =>
          (p.category || '').toLowerCase().includes(cat)
        )
      )
    : allProducts;

  return (
    <div className="pt-32 pb-20 min-h-screen bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-2">All Prints</h1>
          <p className="text-gray-500 text-lg">Browse our full collection of premium aesthetic wall art.</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 mb-8">
          {FILTER_TABS.map(tab => {
            const isActive = activeFilter === tab.value;
            return (
              <Link
                key={tab.value}
                href={tab.value ? `/shop?category=${tab.value}` : '/shop'}
                className={`shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all border ${
                  isActive
                    ? 'bg-accent-blue text-white border-accent-blue shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-accent-blue hover:text-accent-blue'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            {/* Illustrated empty state */}
            <div className="relative mb-8">
              <div className="text-[80px] leading-none select-none">🎨</div>
              <div className="absolute -top-2 -right-4 text-3xl animate-bounce">✨</div>
              <div className="absolute -bottom-2 -left-4 text-3xl animate-pulse">🖼️</div>
            </div>
            <h3 className="text-2xl font-heading font-bold text-gray-900 mb-3">
              {activeFilter ? `No ${activeFilter} yet` : 'Nothing here yet'}
            </h3>
            <p className="text-gray-500 max-w-sm mb-8 leading-relaxed">
              We're constantly curating new prints. Check out our other collections while we prepare something epic.
            </p>
            {/* Suggested categories */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/posters" className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-accent-blue hover:text-accent-blue transition-all shadow-sm">
                🎌 Posters
              </Link>
              <Link href="/polaroids" className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-accent-blue hover:text-accent-blue transition-all shadow-sm">
                📸 Polaroids
              </Link>
              <Link href="/custom" className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-all shadow-sm">
                ✦ Custom Print
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map(product => (
              <div key={product.slug} className="group will-change-transform h-full">
                <TiltWrapper className="w-full h-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 flex flex-col">
                  <Link href={`/product/${product.slug}`} className="flex flex-col h-full">
                    <div className="relative aspect-[3/4] bg-gray-50">
                      <Image src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.jpg'} alt={product.title} fill sizes="(max-width: 640px) 50vw, 25vw" className={`object-cover group-hover:scale-105 transition-transform duration-500 ${product.stock <= 0 ? 'opacity-50 grayscale' : ''}`} />
                      {product.stock <= 0 ? (
                        <div className="absolute top-3 left-3 bg-black/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">
                          Out of Stock
                        </div>
                      ) : product.featured && (
                        <div className="absolute top-3 left-3 bg-white/90 text-black text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">
                          Featured
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{product.category}</p>
                      <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-accent-blue transition-colors mb-2">{product.title}</h3>
                      <div className="flex items-center gap-2 mt-auto">
                        <span className="font-bold">₹{product.salePrice || product.price}</span>
                        {product.salePrice && <span className="text-sm text-gray-400 line-through">₹{product.price}</span>}
                      </div>
                    </div>
                  </Link>
                </TiltWrapper>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

