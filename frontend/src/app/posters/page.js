import Link from 'next/link';
import Image from 'next/image';
import { getStorefrontProducts } from '@/lib/products';
import { Sparkles, Palette, PackageOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PostersPage() {
  const allProducts = await getStorefrontProducts();
  // Sync with DB category values set in AddProductDrawer
  const POSTER_CATEGORIES = ['standard posters', 'premium posters', 'posters'];
  const posters = allProducts.filter(p =>
    POSTER_CATEGORIES.some(cat => (p.category || '').toLowerCase().includes(cat))
  );

  return (
    <div className="min-h-screen bg-background">

      {/* ── Cinematic Hero Banner ── */}
      <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <Image
          src="/images/batman.jpg"
          alt="Posters hero"
          fill
          className="object-cover object-center scale-105"
          priority
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pt-16">
          <p className="text-amber-400 text-xs font-bold uppercase tracking-[0.3em] mb-4 opacity-90">
            ✦ Premium Wall Art ✦
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-black text-white leading-none mb-6 drop-shadow-2xl">
            Your Walls<br />Deserve a Story
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-xl mb-10 font-light leading-relaxed">
            Museum-grade posters, delivered to your door. From anime to cinema, find the artwork that speaks to you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="#posters-grid" className="px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-amber-400 transition-all duration-300 shadow-2xl hover:shadow-amber-400/30 text-sm tracking-wide">
              Shop Posters ↓
            </a>
            <Link href="/custom" className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/30 rounded-full font-semibold hover:bg-white/20 transition-all duration-300 text-sm tracking-wide">
              Custom Print →
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
          <div className="w-px h-10 bg-gradient-to-b from-transparent to-white/40" />
        </div>
      </div>

      <div id="posters-grid" className="container mx-auto px-4 lg:px-8 max-w-6xl pt-16 pb-20">
        
        {/* Custom Poster Banner */}
        <div className="mb-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-blue-100">
          <div className="relative z-10 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-200/50 text-blue-800 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              <Sparkles className="w-3 h-3" /> Custom Option
            </div>
            <h2 className="text-3xl font-heading font-bold mb-4 text-gray-900">Design a Custom Poster</h2>
            <p className="text-gray-700 mb-6">Can't find exactly what you want? Upload your own high-resolution image and we will print it as a premium poster with optional framing.</p>
            <Link 
              href="/custom" 
              className="btn-primary inline-flex items-center justify-center px-8 py-4 bg-black text-white rounded-xl font-semibold shadow-lg"
            >
              <div className="btn-primary-inner"></div>
              Start Designing <Palette className="w-5 h-5 ml-2" />
            </Link>
          </div>
          <div className="relative z-10 w-full md:w-1/2 aspect-video bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-xl overflow-hidden flex items-center justify-center">
             <div className="w-48 h-64 bg-white p-2 rounded-xl shadow-2xl border border-gray-100 transform rotate-[2deg]">
               <div className="w-full h-full bg-gray-200 relative rounded-lg overflow-hidden">
                 <Image src="/images/master.jpg" fill className="object-cover" alt="sample poster" />
               </div>
             </div>
          </div>
        </div>

        {/* Posters Products Grid */}
        <h3 className="text-2xl font-heading font-bold mb-6">Shop Posters</h3>
        
        {posters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative mb-8">
              <div className="text-[80px] leading-none select-none">🎌</div>
              <div className="absolute -top-2 -right-4 text-3xl animate-bounce">✨</div>
              <div className="absolute -bottom-2 -left-4 text-3xl animate-pulse">🖼️</div>
            </div>
            <h3 className="text-2xl font-heading font-bold text-gray-900 mb-3">Posters dropping soon</h3>
            <p className="text-gray-500 max-w-sm mb-8 leading-relaxed">
              We're selecting only the most premium pieces. Come back soon — or design your own!
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/custom" className="px-6 py-3 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-all">
                ✦ Design Custom Poster
              </Link>
              <Link href="/shop" className="px-6 py-3 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-black transition-all">
                Browse All Prints
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {posters.map(product => (
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
