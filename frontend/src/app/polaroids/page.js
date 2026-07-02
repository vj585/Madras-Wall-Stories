import Link from 'next/link';
import Image from 'next/image';
import { getStorefrontProducts } from '@/lib/products';
import { Sparkles, Camera, PackageOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PolaroidsPage() {
  const allProducts = await getStorefrontProducts();
  // Sync with DB category values set in AddProductDrawer
  const POLAROID_CATEGORIES = ['polaroids', 'standard polaroid', 'custom polaroid'];
  const polaroids = allProducts.filter(p =>
    POLAROID_CATEGORIES.some(cat => (p.category || '').toLowerCase().includes(cat))
  );

  return (
    <div className="pt-24 pb-20 min-h-screen bg-background">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        
        {/* Header Section */}
        <div className="text-center mb-12 mt-8">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">Polaroids</h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">Turn your digital gallery into retro aesthetics. Shop our pre-made vintage collections or create your own custom memories.</p>
        </div>

        {/* Custom Polaroid Banner */}
        <div className="mb-16 bg-gradient-to-br from-amber-50 to-amber-100 rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-amber-200/50">
          <div className="relative z-10 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-200/50 text-amber-800 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              <Sparkles className="w-3 h-3" /> Custom Option
            </div>
            <h2 className="text-3xl font-heading font-bold mb-4 text-gray-900">Create Custom Polaroids</h2>
            <p className="text-gray-700 mb-6">Upload your favorite photos from your camera roll, and we'll print them on authentic-feeling premium polaroid stock.</p>
            <Link 
              href="/custom"
              className="inline-flex items-center justify-center px-8 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Start Creating <Camera className="w-5 h-5 ml-2" />
            </Link>
          </div>
          <div className="relative z-10 w-full md:w-1/2 aspect-video bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-xl overflow-hidden flex items-center justify-center">
             <div className="flex gap-4 transform rotate-[-5deg]">
               <div className="w-32 h-40 bg-white p-2 pb-8 rounded shadow-lg border border-gray-100"><div className="w-full h-full bg-gray-200 relative"><Image src="/images/michael.jpg" fill className="object-cover" alt="sample" /></div></div>
               <div className="w-32 h-40 bg-white p-2 pb-8 rounded shadow-lg border border-gray-100 transform rotate-[10deg] translate-y-4"><div className="w-full h-full bg-gray-200 relative"><Image src="/images/batman.jpg" fill className="object-cover" alt="sample" /></div></div>
             </div>
          </div>
        </div>

        {/* Polaroid Products Grid */}
        <h3 className="text-2xl font-heading font-bold mb-6">Shop Polaroids</h3>
        
        {polaroids.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <PackageOpen className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No polaroids available yet</h3>
            <p className="text-gray-500 text-center max-w-sm">We are currently curating our collection. Check back soon for premium prints.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {polaroids.map(product => (
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
