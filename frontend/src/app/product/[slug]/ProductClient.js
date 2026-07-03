"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Heart, Share2, Star, Truck, Shield, RefreshCw,
  ChevronDown, ChevronUp, ShoppingCart, ArrowLeft, X, ZoomIn
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import StarRatingForm from '@/components/product/StarRatingForm';

const btnClass = "py-3 px-4 rounded-xl border text-sm font-medium transition-all";
const activeBtn = "border-accent-blue bg-accent-blue/10 text-accent-blue";
const idleBtn = "border-gray-200 hover:border-gray-300 text-gray-700";

export default function ProductClient({ product, related = [], framePricing = [] }) {
  const router = useRouter();
  const { addToCart } = useCart();

  const variants = product?.variants || [];
  const defaultVariant = variants[0] || {};
  
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(defaultVariant.size || '');
  
  // Find active variant based on selected size
  const activeVariant = variants.find(v => v.size === selectedSize) || defaultVariant;
  
  const [selectedFrame, setSelectedFrame] = useState(activeVariant.frames?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState('materials');
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [addedToCart, setAddedToCart] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const productUrl = typeof window !== 'undefined' ? window.location.href : '';
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent('Check out this amazing poster: ' + product.title + ' - ' + productUrl)}`;
  const instagramUrl = `https://www.instagram.com/madras.wallstories/`;

  const discountPct = activeVariant.salePrice && activeVariant.price > activeVariant.salePrice 
    ? Math.round(((activeVariant.price - activeVariant.salePrice) / activeVariant.price) * 100) 
    : 0;
  const totalStock = variants.reduce((acc, v) => acc + (v.stock || 0), 0);
  const currentStock = variants.length > 0 ? (activeVariant.stock || 0) : (product.stock || 0);

  useEffect(() => {
    if (currentStock <= 0) {
      if (quantity !== 0) setQuantity(0);
    } else if (quantity === 0 || quantity > currentStock) {
      setQuantity(Math.min(Math.max(1, quantity || 1), currentStock));
    }
  }, [currentStock, quantity]);

  const calculatePrice = () => {
    let p = activeVariant.salePrice || activeVariant.price || 0;
    
    if (selectedFrame) {
      const frameConfig = framePricing.find(f => f.name === selectedFrame);
      if (frameConfig && frameConfig.markup) {
        p += frameConfig.markup;
      }
    }
    
    return p * quantity;
  };

  const handleAddToCart = () => {
    addToCart({
      id: product.slug,
      _id: product._id,
      name: product.title,
      price: calculatePrice() / quantity,
      image: product.images && product.images.length > 0 ? product.images[0] : '/placeholder.jpg',
      size: selectedSize,
      frame: selectedFrame,
      quantity,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="pt-24 pb-20 bg-background text-foreground min-h-screen">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <button onClick={() => router.back()} className="flex items-center gap-1 hover:text-black transition-colors">
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" /> Back
          </button>
          <span>/</span>
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-400">{product.category}</span>
          <span>/</span>
          <span className="text-black font-medium line-clamp-1">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

          {/* Left: Image Gallery */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-[3/4] bg-gray-100 rounded-3xl overflow-hidden relative group"
            >
              <Image
                src={product.images && product.images.length > 0 ? product.images[activeImage] : '/placeholder.jpg'}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover cursor-crosshair group-hover:scale-105 transition-transform duration-500"
                priority
              />
              {totalStock <= 0 ? (
                <div className="absolute top-4 left-4 bg-black/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">
                  Out of Stock
                </div>
              ) : product.badge ? (
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-black text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">
                  {product.badge}
                </div>
              ) : null}
              <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`w-11 h-11 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center transition-colors shadow-lg ${isInWishlist(product.slug) ? 'text-red-500' : 'text-gray-500 hover:text-red-400'}`}
                >
                  <Heart className={`w-5 h-5 ${isInWishlist(product.slug) ? 'fill-current' : ''}`} />
                </button>
                {/* WhatsApp Share */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-green-50 transition-colors"
                  title="Share on WhatsApp"
                >
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
                {/* Instagram */}
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-pink-50 transition-colors"
                  title="Find us on Instagram"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color:'#E1306C'}}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
              </div>

              {/* Zoom hint */}
              <button
                onClick={() => setLightboxOpen(true)}
                className="absolute bottom-4 right-4 z-10 w-9 h-9 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-600 hover:bg-white shadow transition-all"
                title="Click to zoom"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </motion.div>

            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
              {product.images && product.images.length > 0 ? (
                product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all relative ${activeImage === idx ? 'border-accent-blue' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <Image src={img} alt={`${product.title} thumbnail ${idx + 1}`} fill sizes="96px" className="object-cover" />
                  </button>
                ))
              ) : (
                <button className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 border-accent-blue flex-shrink-0 relative">
                  <Image src="/placeholder.jpg" alt="placeholder" fill sizes="96px" className="object-cover" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col">

            {/* Rating + Title + Price */}
            <div className="mb-6 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex text-accent-yellow">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating || 0) ? 'fill-current' : ''}`} />
                  ))}
                </div>
                <span className="text-sm font-semibold">{product.rating || 0}</span>
                <span className="text-sm text-gray-400">({product.numReviews || 0} reviews)</span>
              </div>

              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">{product.category}</p>
              <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-tight mb-4">{product.title}</h1>

              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-3xl font-bold">
                  ₹{activeVariant.salePrice || activeVariant.price}
                </span>
                {activeVariant.salePrice && activeVariant.price > activeVariant.salePrice && (
                  <>
                    <span className="text-xl text-gray-400 line-through">₹{activeVariant.price}</span>
                    <span className="bg-red-50 text-red-600 border border-red-100 px-3 py-1 rounded-full text-sm font-bold">
                      SAVE {discountPct}%
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Size Selector */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-base">Size</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {variants.map(v => (
                  <button
                    key={v.size}
                    onClick={() => {
                      setSelectedSize(v.size);
                      if (v.frames && !v.frames.includes(selectedFrame)) {
                        setSelectedFrame(v.frames[0] || '');
                      }
                    }}
                    className={`${btnClass} ${selectedSize === v.size ? activeBtn : idleBtn}`}
                  >
                    {v.size}
                  </button>
                ))}
              </div>
            </div>

            {/* Frame Selector */}
            {activeVariant.frames && activeVariant.frames.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold text-base mb-3">Frame</h3>
                <div className="grid grid-cols-2 gap-2">
                  {activeVariant.frames.map(frame => {
                    const frameConfig = framePricing.find(f => f.name === frame);
                    const markup = frameConfig?.markup ? ` (+₹${frameConfig.markup})` : '';
                    return (
                      <button
                        key={frame}
                        onClick={() => setSelectedFrame(frame)}
                        className={`${btnClass} text-left flex justify-between ${selectedFrame === frame ? activeBtn : idleBtn}`}
                      >
                        <span>{frame}</span>
                        <span className="text-xs opacity-70">{markup}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Inventory Status */}
            <div className="mb-4 text-sm">
              {currentStock <= 0 ? (
                <span className="text-red-600 font-bold flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-600"></span>Out of Stock</span>
              ) : currentStock <= 5 ? (
                <span className="text-orange-500 font-bold flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>Only {currentStock} Left!</span>
              ) : (
                <span className="text-green-600 font-bold flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-600"></span>In Stock</span>
              )}
            </div>

            {/* Quantity + Add to Cart */}
            <div className="flex gap-3 mb-6">
              <div className={`flex items-center border border-gray-200 rounded-xl h-14 w-28 justify-between px-4 flex-shrink-0 ${currentStock <= 0 ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''}`}>
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))} 
                  disabled={currentStock <= 0}
                  className={`text-xl transition-colors ${currentStock <= 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-500 hover:text-black'}`}
                >−</button>
                <span className={`font-bold ${currentStock <= 0 ? 'text-gray-400' : ''}`}>{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => (q < currentStock ? q + 1 : q))} 
                  disabled={currentStock <= 0}
                  className={`text-xl transition-colors ${currentStock <= 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-500 hover:text-black'}`}
                >+</button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={currentStock <= 0}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl font-bold transition-all h-14 btn-premium ${
                  addedToCart
                    ? 'bg-green-600 text-white'
                    : currentStock <= 0
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-900 shadow-xl'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                {currentStock <= 0 ? 'Out of Stock' : addedToCart ? 'Added! ✓' : `Add to Cart — ₹${calculatePrice()}`}
              </button>
            </div>

            {/* Trust Features */}
            <div className="mb-8 py-5 border-y border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500 shrink-0" />
                  <span>Premium Quality Prints</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500 shrink-0" />
                  <span>Secure Payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500 shrink-0" />
                  <span>Cash on Delivery Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-accent-blue shrink-0" />
                  <span>Ships Within 1–2 Business Days</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-accent-blue shrink-0" />
                  <span>Free Shipping Above ₹299</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500 shrink-0" />
                  <span>Carefully Packed</span>
                </div>
              </div>
            </div>

            {/* Product Description */}
            {product.description && (
              <div className="mb-6 text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </div>
            )}

            {/* Accordions */}
            <div className="space-y-3">
              {[
                { 
                  id: 'materials', 
                  title: 'Materials & Finish', 
                  content: (
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-blue mt-1.5 shrink-0"></div>
                        <span><strong className="text-gray-900 font-semibold">Premium Quality:</strong> Printed on museum-grade 300 GSM art board for unmatched durability.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-blue mt-1.5 shrink-0"></div>
                        <span><strong className="text-gray-900 font-semibold">Vibrant Colors:</strong> Acid-free inks guarantee fade-resistant, long-lasting vibrancy.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-blue mt-1.5 shrink-0"></div>
                        <span><strong className="text-gray-900 font-semibold">Sleek Frames:</strong> Crafted from engineered wood with shatter-proof acrylic glass for a premium finish.</span>
                      </li>
                    </ul>
                  )
                },
                { 
                  id: 'shipping', 
                  title: 'Shipping & Returns', 
                  content: (
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></div>
                        <span><strong className="text-gray-900 font-semibold">Fast Dispatch:</strong> Orders are processed and shipped within 24–48 hours.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></div>
                        <span><strong className="text-gray-900 font-semibold">Speedy Delivery:</strong> Expect your poster in 3–5 working days across India.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></div>
                        <span><strong className="text-gray-900 font-semibold">Hassle-Free Returns:</strong> We offer a 7-day replacement policy if your product arrives damaged.</span>
                      </li>
                    </ul>
                  )
                },
              ].map(item => (
                <div key={item.id} className="border border-gray-100 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setActiveAccordion(activeAccordion === item.id ? '' : item.id)}
                    className="w-full flex items-center justify-between p-4 font-semibold text-left bg-gray-50 hover:bg-gray-100 transition-colors text-sm"
                  >
                    {item.title}
                    {activeAccordion === item.id ? <ChevronUp className="w-4 h-4 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 flex-shrink-0" />}
                  </button>
                  {activeAccordion === item.id && (
                    <div className="p-4 text-gray-500 text-sm leading-relaxed bg-white">
                      {item.content}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Star Rating Submission Component */}
            <StarRatingForm productId={product._id} />
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-24">
            <h2 className="text-2xl font-heading font-bold mb-8">You Might Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {related.map(rel => (
                <Link key={rel._id} href={`/product/${rel.slug}`} className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100">
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
                    <Image
                      src={rel.images && rel.images.length > 0 ? rel.images[0] : '/placeholder.jpg'}
                      alt={rel.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">{rel.category}</p>
                    <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-accent-blue transition-colors">{rel.title}</h3>
                    <p className="font-bold mt-1">₹{rel.salePrice}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── Image Lightbox ── */}
      {lightboxOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            className="absolute top-5 right-5 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all z-10"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image counter */}
          {product.images?.length > 1 && (
            <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium">
              {activeImage + 1} / {product.images.length}
            </div>
          )}

          {/* Main zoomed image */}
          <div
            className="relative w-full max-w-xl max-h-[85vh] aspect-[3/4]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={product.images?.[activeImage] || '/placeholder.jpg'}
              alt={product.title}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>

          {/* Thumbnail strip */}
          {product.images?.length > 1 && (
            <div
              className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 relative transition-all ${activeImage === idx ? 'border-white scale-110' : 'border-white/30 opacity-60 hover:opacity-100'}`}
                >
                  <Image src={img} alt="" fill sizes="48px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
