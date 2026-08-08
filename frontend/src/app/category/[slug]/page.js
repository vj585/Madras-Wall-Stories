import Link from 'next/link';
import { getStorefrontProducts } from '@/lib/products';
import { getProductDesignType } from '@/lib/productUtils';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const slug = decodeURIComponent(resolvedParams?.slug || '');
  const type = resolvedSearchParams?.type || 'posters';
  
  const categoryNames = {
    'anime': 'Anime',
    'superhero': 'Superhero Collections',
    'movies': 'Movie Collections',
    'tv-series': 'TV-Series Collections',
    'music': 'Music Collections',
    'cars': 'Car Collections',
    'gaming': 'Video Game Collections',
    'motivate': 'Motivate Collections',
    'cricket': 'Cricket Collections',
    'football': 'Football Collections',
    'f1': 'F1 Collections',
    'pop-culture': 'Pop Culture',
    'aesthetic': 'Room Aesthetic',
    'gifts': 'Gifting Sets',
    'sports': 'Sports Collections',
  };

  const displayName = categoryNames[slug] || slug?.replace(/-/g, ' ');
  const displayType = type === 'stickers' ? 'Stickers' : type === 'polaroids' ? 'Polaroids' : 'Posters';
  const title = `${displayName} ${displayType} | Madras Prints`;
  const description = `Shop the best premium ${displayName} ${displayType.toLowerCase()} and prints at Madras Prints. Upgrade your decor today!`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default async function CategoryPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const slug = decodeURIComponent(resolvedParams?.slug || '');
  const type = (resolvedSearchParams?.type || 'posters').toLowerCase();

  // Map slugs to display names
  const categoryMap = {
    'anime': { display: 'Anime', match: ['anime'] },
    'superhero': { display: 'Superhero Collections', match: ['superhero'] },
    'movies': { display: 'Movie Collections', match: ['movies', 'movie'] },
    'tv-series': { display: 'TV-Series Collections', match: ['tv-series', 'tv'] },
    'music': { display: 'Music Collections', match: ['music'] },
    'cars': { display: 'Car Collections', match: ['cars', 'car'] },
    'gaming': { display: 'Video Game Collections', match: ['video games', 'gaming'] },
    'motivate': { display: 'Motivate Collections', match: ['motivate', 'motivation'] },
    'cricket': { display: 'Cricket Collections', match: ['cricket'] },
    'football': { display: 'Football Collections', match: ['football'] },
    'f1': { display: 'F1 Collections', match: ['f1', 'formula 1', 'formula one'] },
    'pop-culture': { display: 'Pop Culture', match: ['pop-culture', 'pop culture'] },
    'aesthetic': { display: 'Room Aesthetic', match: ['aesthetic', 'room'] },
    'gifts': { display: 'Gifting Sets', match: ['gifts', 'gifting'] },
    'sports': { display: 'Sports Collections', match: ['sports', 'cricket', 'football', 'f1'] },
  };

  const categoryInfo = categoryMap[slug] || { 
    display: slug?.replace(/-/g, ' '), 
    match: [slug?.replace(/-/g, ' ')] 
  };
  
  const displayName = categoryInfo.display;
  const displayType = type === 'stickers' ? 'Stickers' : type === 'polaroids' ? 'Polaroids' : 'Posters';

  const allProducts = await getStorefrontProducts();

  const filtered = allProducts.filter(p => {
    // 1. Filter by product type using robust utility
    const productType = getProductDesignType(p);
    
    // The `type` variable from searchParams is already normalized to 'stickers', 'polaroids', or 'posters'
    if (productType !== type) return false;

    // 2. Filter by theme
    const fieldsToSearch = [
      p.category,
      p.theme,
      ...(p.tags || [])
    ]
      .filter(Boolean)
      .map(f => f.toLowerCase().trim());
    
    return categoryInfo.match.some(m => {
      const matchStr = m.toLowerCase().trim();
      return fieldsToSearch.some(field => field.includes(matchStr) || matchStr === field);
    });
  });

  const display = filtered;

  return (
    <div className="pt-32 pb-20 min-h-screen bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-12">
          <Link href="/" className="text-sm text-gray-400 hover:text-black transition-colors">← Back to Home</Link>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mt-4 mb-4 capitalize">{displayName} {displayType}</h1>
          <p className="text-gray-500">{display.length} items available</p>
        </div>
        {display.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm mt-8 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No {displayType.toLowerCase()} available yet</h3>
            <p className="text-gray-500 max-w-sm mb-6">We are currently curating our {displayName} collection. Check back soon for premium {displayType.toLowerCase()}.</p>
            <Link href="/shop" className="px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-sm">
              Browse {displayType}
            </Link>
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
