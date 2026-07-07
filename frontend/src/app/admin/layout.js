"use client";
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, ShoppingCart, Users, Package, Settings, Tag, 
  ImageIcon, LogOut, Menu, X, BarChart, FileImage, Shield
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import { useSession, signOut } from 'next-auth/react';

export default function AdminLayout({ children }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

  const menu = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { name: 'Orders', icon: ShoppingCart, href: '/admin/orders' },
    { name: 'Products', icon: Package, href: '/admin/products' },
    { name: 'Custom Prints', icon: FileImage, href: '/admin/custom-prints' },
    { name: 'Customers', icon: Users, href: '/admin/customers' },
    { name: 'Coupons', icon: Tag, href: '/admin/coupons' },
    { name: 'Banners', icon: ImageIcon, href: '/admin/banners' },
    { name: 'Analytics', icon: BarChart, href: '/admin/analytics' },
    { name: 'Admins', icon: Shield, href: '/admin/admins' },
    { name: 'Settings', icon: Settings, href: '/admin/settings' },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center justify-between">
        <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
          <h1 className="font-heading font-bold text-xl tracking-tighter text-black">
            MADRAS<span className="text-accent-yellow">.</span>WALL
          </h1>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Admin Portal</p>
        </Link>
        <button 
          className="md:hidden p-2 text-gray-500 hover:text-black rounded-lg transition-colors"
          onClick={() => setMobileMenuOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto safe-bottom">
        {menu.map(item => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-black text-white shadow-md shadow-black/10' 
                  : 'text-gray-500 hover:text-black hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-100 safe-bottom">
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans safe-top safe-bottom">
        {/* Desktop Sidebar Fixed */}
        <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col fixed inset-y-0 left-0 z-10 shadow-sm">
          <SidebarContent />
        </aside>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                onClick={() => setMobileMenuOpen(false)}
              />
              {/* Drawer */}
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                className="fixed inset-y-0 left-0 z-50 w-72 bg-white flex flex-col shadow-2xl md:hidden"
              >
                <SidebarContent />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Content Wrapper */}
        <div className="flex-1 md:ml-64 flex flex-col min-h-screen w-full md:w-[calc(100%-16rem)]">
          {/* Top Header */}
          <header className="bg-white border-b border-gray-100 p-4 sticky top-0 z-40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="md:hidden font-heading font-bold text-lg tracking-tighter text-black">
                MADRAS<span className="text-accent-yellow">.</span>WALL
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-xs font-bold text-white uppercase">
                  {session?.user?.email?.[0] || 'A'}
                </div>
                <span className="text-sm font-medium hidden sm:block text-gray-700">{session?.user?.email}</span>
              </div>
              <button 
                onClick={() => signOut({ callbackUrl: '/login' })} 
                className="text-sm font-medium text-gray-500 hover:text-red-500 flex items-center gap-1.5 transition-colors border-l border-gray-200 pl-4"
                title="Logout"
              >
                <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 p-4 md:p-8 w-full overflow-x-hidden">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>

      </div>
  );
}
