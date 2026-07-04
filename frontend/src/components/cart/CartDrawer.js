"use client";
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { FREE_SHIPPING_THRESHOLD } from '@/utils/shippingUtils';

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const progress = Math.min((cartTotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          {/* Drawer */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] md:w-[450px] bg-background shadow-2xl z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-heading font-bold text-xl flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" /> Your Cart
              </h2>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress */}
            {cartItems.length > 0 && (
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <p className="text-sm font-medium mb-3 text-center">
                  {progress >= 100 
                    ? <span className="text-green-600 font-bold">Congratulations! You've unlocked FREE SHIPPING. 🎉</span>
                    : <span>Spend <span className="font-bold">₹{FREE_SHIPPING_THRESHOLD - cartTotal}</span> more to unlock <span className="font-bold text-accent-blue">FREE SHIPPING</span>.</span>}
                </p>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-accent-blue"
                  />
                </div>
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 space-y-4">
                  <ShoppingBag className="w-16 h-16 opacity-20 text-gray-400" />
                  <h3 className="text-xl font-heading font-bold text-gray-900">Your wall is waiting for its story.</h3>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="text-accent-blue font-medium hover:underline"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item, idx) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={`${item.id}-${idx}`} 
                    className="flex gap-4 group"
                  >
                    <div className="w-24 h-32 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-semibold text-base leading-tight line-clamp-2">{item.name}</h3>
                          <button 
                            onClick={() => removeFromCart(idx)}
                            className="text-gray-400 hover:text-red-500 transition-colors mt-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {item.id?.startsWith('custom-') ? (
                            <div className="flex flex-wrap gap-1 text-accent-blue">
                              <span>{item.size}</span>
                              {item.customDetails?.finish && <span>• {item.customDetails.finish}</span>}
                              {item.customDetails?.caption && <span>• "{item.customDetails.caption}"</span>}
                            </div>
                          ) : (
                            <span>{item.size} • {item.frame}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button 
                            onClick={() => updateQuantity(idx, -1)}
                            className="p-2 hover:bg-gray-100 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(idx, 1)}
                            className="p-2 hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="font-bold">₹{item.price * item.quantity}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-gray-200 bg-background">
                <div className="flex justify-between mb-4">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-bold text-lg">₹{cartTotal}</span>
                </div>
                <Link href="/checkout" onClick={() => setIsCartOpen(false)}>
                  <button className="btn-primary w-full py-4 bg-black text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg">
                    <div className="btn-primary-inner"></div>
                    Checkout Now <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
