import Link from 'next/link';
import { getStorefrontProducts } from '@/lib/products';
import Image from 'next/image';
import { PackageOpen } from 'lucide-react';
import TiltWrapper from '@/components/ui/TiltWrapper';

export const dynamic = 'force-dynamic';

export default async function ShopPage() {
  const products = await getStorefrontProducts();

  return (
    <div className="pt-32 pb-20 min-h-screen bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">All Prints</h1>
          <p className="text-gray-500 text-lg">Browse our full collection of premium aesthetic wall art.</p>
        </div>
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <PackageOpen className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No posters available yet</h3>
            <p className="text-gray-500 text-center max-w-sm">We are currently curating our collection. Check back soon for premium prints.</p>
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
