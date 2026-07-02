import StoreLayoutWrapper from '@/components/layout/StoreLayoutWrapper';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import AuthProvider from './Providers';
import './globals.css';

export const metadata = {
  metadataBase: new URL('https://madraswallstories.com'),
  title: 'Madras Wall Stories | Premium Aesthetic Posters & Memory Prints',
  description: 'Transform your space with premium aesthetic posters, vintage polaroids, and custom framed prints. High-quality decor crafted for modern lifestyle and memories.',
  keywords: 'posters, wall decor, aesthetic prints, polaroids, custom frames, room decor',
  openGraph: {
    title: 'Madras Wall Stories | Premium Aesthetic Posters',
    description: 'Transform your space with premium aesthetic posters and custom polaroids.',
    url: 'https://madraswallstories.com',
    siteName: 'Madras Wall Stories',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Madras Wall Stories',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Madras Wall Stories | Premium Aesthetic Posters',
    description: 'Transform your space with premium aesthetic posters and custom polaroids.',
    images: ['/images/og-image.jpg'],
  },
};

export const viewport = {
  themeColor: '#FFFDF7',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased pb-16 md:pb-0" suppressHydrationWarning>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <StoreLayoutWrapper>
                {children}
              </StoreLayoutWrapper>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
