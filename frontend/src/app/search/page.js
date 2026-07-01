"use client";
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Frown } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [localQuery, setLocalQuery] = useState(q);

  useEffect(() => {
    async function fetchResults() {
      if (!q) {
        setResults([]);
        return;
      }
      try {
        const res = await fetch('/api/products?activeOnly=true');
        const data = await res.json();
        
        if (data.success && data.data) {
          const lowerQ = q.toLowerCase();
          const activeProducts = data.data;
          
          const filtered = activeProducts.filter(p => 
            p.title.toLowerCase().includes(lowerQ) || 
            p.category.toLowerCase().includes(lowerQ) ||
            p.tags?.some(tag => tag.toLowerCase().includes(lowerQ))
          );
          setResults(filtered);
        }
      } catch (err) {
        console.error('Failed to search products:', err);
      }
    }
    fetchResults();
  }, [q]);

  return (
    <div className="pt-32 pb-20 min-h-screen bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-12">
          <h1 className="text-4xl font-heading font-bold mb-4">Search</h1>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (localQuery.trim()) {
                router.push(`/search?q=${encodeURIComponent(localQuery)}`);
              }
            }}
            className="relative max-w-2xl w-full mb-6"
          >
            <input
              type="text"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Search for posters, anime, movies..."
              className="w-full pl-6 pr-14 py-4 rounded-full border border-gray-200 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none text-lg shadow-sm transition-all"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors">
              <Search className="w-5 h-5" />
            </button>
          </form>

          {q && (
            <p className="text-gray-500">Showing results for "{q}"</p>
          )}
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {results.map(product => (
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
        ) : q ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Frown className="w-16 h-16 text-gray-200 mb-4" />
            <h2 className="text-2xl font-bold mb-2">No matches found.</h2>
            <p className="text-gray-500 max-w-md mb-8">We couldn't find anything matching "{q}". Try searching for something else or browse our collections.</p>
            <Link href="/shop" className="px-8 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors">
              Browse All Prints
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="w-16 h-16 text-gray-200 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Start Searching</h2>
            <p className="text-gray-500 max-w-md mb-8">Type keywords like "Batman" or "Vintage" in the search bar above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
