"use client";
import { Home, Search, Heart, ShoppingBag, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { cartItems, setIsCartOpen } = useCart();

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Search, label: 'Search', href: '/search' },
    { icon: Heart, label: 'Wishlist', href: '/wishlist' },
    { icon: User, label: 'Profile', href: '/login' },
  ];

  // Don't show on admin or checkout
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/checkout')) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 z-50 pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item, idx) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={idx} href={item.href} className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-black transition-colors">
              <Icon className={`w-6 h-6 ${isActive ? 'text-black fill-black/10' : ''}`} />
              <span className={`text-[10px] mt-1 ${isActive ? 'font-semibold text-black' : ''}`}>{item.label}</span>
            </Link>
          );
        })}
        
        <button 
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-black transition-colors relative"
        >
          <div className="relative">
            <ShoppingBag className="w-6 h-6" />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent-blue text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
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
