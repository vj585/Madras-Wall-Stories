"use client";
import { Home, Search, Heart, ShoppingBag, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';

export default function BottomNav() {
  const pathname = usePathname();
  const { cartItems, setIsCartOpen } = useCart();
  const { data: session } = useSession();

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Search, label: 'Search', href: '/search' },
    { icon: Heart, label: 'Wishlist', href: '/wishlist' },
    { icon: User, label: 'Profile', href: session?.user ? ((session.user.role === 'ADMIN' || session.user.role === 'admin') ? '/admin' : '/account') : '/login' },
  ];

  // Don't show on admin or checkout
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/checkout')) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 z-50 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item, idx) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={idx} href={item.href} className="flex flex-col items-center justify-center w-full h-full relative group">
              {/* Gold active dot indicator */}
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-accent-yellow"
                  transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                />
              )}
              <Icon
                className={`w-5 h-5 transition-colors duration-200 ${
                  isActive ? 'text-accent-blue' : 'text-gray-400 group-active:text-gray-700'
                }`}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span className={`text-[10px] mt-1 transition-colors duration-200 ${
                isActive ? 'font-semibold text-accent-blue' : 'text-gray-400'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
        
        <button 
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center w-full h-full text-gray-400 group active:text-gray-700 transition-colors relative"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" strokeWidth={1.8} />
            {cartItems.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-accent-blue text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-white">
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1">Cart</span>
        </button>
      </div>
    </div>
  );
}
