import Link from 'next/link';
import { getStorefrontProducts } from '@/lib/products';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params }) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams?.slug || '');

  // Map slugs to display names
  const categoryNames = {
    'anime': 'Anime Posters',
    'movies': 'Movie Posters',
    'pop-culture': 'Pop Culture',
    'horror': 'Horror Prints',
    'pop-art': 'Pop Art',
    'kollywood': 'Kollywood',
    'aesthetic': 'Room Aesthetic',
    'gifts': 'Gifting Sets',
  };

  const displayName = categoryNames[slug] || slug?.replace(/-/g, ' ');

  const allProducts = await getStorefrontProducts();

  // Filter products loosely by category name (case-insensitive)
  const filtered = allProducts.filter(p =>
    p.category.toLowerCase().includes(displayName?.toLowerCase()) ||
    displayName?.toLowerCase().includes(p.category.toLowerCase())
  );

  // Fallback to empty array if no match
  const display = filtered;

  return (
    <div className="pt-32 pb-20 min-h-screen bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-12">
          <Link href="/" className="text-sm text-gray-400 hover:text-black transition-colors">← Back to Home</Link>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mt-4 mb-4 capitalize">{displayName}</h1>
          <p className="text-gray-500">{display.length} prints available</p>
        </div>
        {display.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm mt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-2">No posters available yet in {displayName}</h3>
            <p className="text-gray-500 text-center max-w-sm">We are currently curating our collection. Check back soon for premium prints.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {display.map(product => (
              <Link key={product.slug} href={`/product/${product.slug}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100">
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
                <div className="p-4">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{product.category}</p>
                  <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-accent-blue transition-colors">{product.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-bold">₹{product.salePrice || product.price}</span>
                    {product.salePrice && <span className="text-sm text-gray-400 line-through">₹{product.price}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
