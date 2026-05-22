"use client";
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';

const CartDrawer = dynamic(() => import('@/components/cart/CartDrawer'));
const Footer = dynamic(() => import('@/components/layout/Footer'));

export default function StoreLayoutWrapper({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
      <BottomNav />
    </>
  );
}
