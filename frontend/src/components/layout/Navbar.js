"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, User, Heart, ShoppingCart, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { cartItems, setIsCartOpen } = useCart();
  const { wishlistItems } = useWishlist();
  const { data: session } = useSession();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Anime Posters', href: '/category/anime' },
    { name: 'Movie Posters', href: '/category/movies' },
    { name: 'Polaroids', href: '/polaroids' },
    { name: 'Custom Prints', href: '/custom' },
    { name: 'Photo Frames', href: '/frames' },
  ];

  return (
    <>
      <header 
        className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'top-0 glass-dark py-4 shadow-lg' : 'top-0 bg-transparent py-5'
        }`}
      >
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button 
          aria-label="Open Mobile Menu"
          className={`md:hidden transition-colors ${isScrolled ? 'text-white hover:text-accent-yellow' : 'text-gray-900 hover:text-accent-blue'}`}
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Logo */}
        <Link href="/" className="flex-shrink-0 z-10">
          <div className="relative h-16 w-52 md:h-20 md:w-60">
            <Image
              src="/images/logo mws.png"
              alt="Madras Wall Stories"
              fill
              sizes="(max-width: 768px) 208px, 240px"
              className="object-contain transition-transform duration-300"
              priority
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 z-10">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-accent-blue ${
                link.highlight 
                  ? 'text-accent-blue font-bold' 
                  : isScrolled ? 'text-gray-200' : 'text-gray-800'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Icons */}
        <div className={`flex items-center space-x-4 md:space-x-6 z-10 ${isScrolled ? 'text-white' : 'text-gray-900'}`}>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
                setSearchQuery('');
              }
            }}
            className="hidden md:flex items-center relative mr-2"
          >
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posters..." 
              className={`w-full lg:w-48 xl:w-64 py-1.5 pl-4 pr-10 text-sm rounded-full outline-none focus:ring-1 focus:ring-accent-blue transition-all border shadow-sm ${
                isScrolled ? 'bg-white/10 border-white/20 text-white placeholder-gray-300' : 'bg-white/80 border-gray-200 text-black placeholder-gray-500'
              }`}
            />
            <button type="submit" aria-label="Search" className="absolute right-3 text-gray-400 hover:text-accent-blue">
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Mobile Search Icon */}
          <Link href="/search" aria-label="Search" className="md:hidden hover:text-accent-blue transition-colors">
            <Search className="w-5 h-5" />
          </Link>
          <Link href={session?.user ? (session.user.role === 'admin' ? '/admin' : '/account') : '/login'} aria-label="Profile" className="hover:text-accent-blue transition-colors hidden md:block relative">
            <User className="w-5 h-5" />
            {session?.user && (
              <span className="absolute -top-1 -right-1 bg-green-500 border-2 border-white w-3 h-3 rounded-full"></span>
            )}
          </Link>
          <Link href="/wishlist" aria-label="Wishlist" className="hover:text-accent-blue transition-colors hidden md:block relative">
            <Heart className="w-5 h-5" />
            {wishlistItems && wishlistItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {wishlistItems.length}
              </span>
            )}
          </Link>
          <button 
            aria-label="Open Cart"
            className="hover:text-accent-blue transition-colors relative"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="w-5 h-5" />
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent-blue text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed inset-0 z-50 bg-background md:hidden flex flex-col"
          >
            <div className="p-4 flex justify-between items-center border-b border-gray-100">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <div className="relative h-10 w-36">
                  <Image src="/images/logo mws.png" alt="Madras Wall Stories" fill sizes="144px" className="object-contain" />
                </div>
              </Link>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 flex flex-col space-y-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className={`text-xl font-medium ${link.highlight ? 'text-accent-yellow' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </header>
    </>
  );
}
