"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (product) => {
    addToCart({
      id: product.slug,
      name: product.title,
      price: product.salePrice,
      image: product.images[0],
      size: product.sizes?.[0] || 'Default',
      frame: product.frameOptions?.[0] || 'Default',
      quantity: 1,
    });
  };

  return (
    <div className="pt-32 pb-20 min-h-screen bg-background">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-12 flex items-center gap-3">
          <Heart className="w-8 h-8 text-red-500 fill-current" />
          <h1 className="text-4xl md:text-5xl font-heading font-bold">Your Wishlist</h1>
        </div>

        {(!wishlistItems || wishlistItems.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Heart className="w-16 h-16 text-gray-200 mb-4" />
            <h2 className="text-2xl font-bold mb-2">It's empty here!</h2>
            <p className="text-gray-500 max-w-md mb-8">You haven't saved any items to your wishlist yet. Explore our collection and find something you love.</p>
            <Link href="/shop" className="px-8 py-4 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition-all">
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {wishlistItems.map((product) => (
              <div key={product.slug} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <button 
                    onClick={(e) => { e.preventDefault(); removeFromWishlist(product.slug); }}
                    className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur-md rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 transition-all shadow-md opacity-0 group-hover:opacity-100"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                    <Link href={`/product/${product.slug}`} className="block w-full h-full">
                      <Image
                        src={product.images[0]}
                        alt={product.title}
                        fill
                        sizes="(max-width: 640px) 50vw, 33vw"
                        className={`object-cover group-hover:scale-105 transition-transform duration-500 ${product.stock <= 0 ? 'opacity-50 grayscale' : ''}`}
                      />
                    </Link>
                    {product.stock <= 0 && (
                      <div className="absolute top-3 left-3 bg-black/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest pointer-events-none">
                        Out of Stock
                      </div>
                    )}
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{product.category}</p>
                  <Link href={`/product/${product.slug}`}>
                    <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-accent-blue transition-colors mb-2">{product.title}</h3>
                  </Link>
                  <div className="mt-auto mb-4 flex items-center gap-2">
                    <span className="font-bold">₹{product.salePrice}</span>
                    <span className="text-sm text-gray-400 line-through">₹{product.price}</span>
                  </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock <= 0}
                      className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm ${product.stock <= 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'}`}
                    >
                      <ShoppingBag className="w-4 h-4" /> {product.stock <= 0 ? 'Out of Stock' : 'Move to Cart'}
                    </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
