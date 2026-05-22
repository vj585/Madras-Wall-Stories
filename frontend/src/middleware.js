import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    if (!token) {
      // No session, redirect to login
      const url = new URL('/login', req.url);
      url.searchParams.set('callbackUrl', encodeURI(req.url));
      return NextResponse.redirect(url);
    }
    
    if (token.role !== 'ADMIN') {
      // Has session but not ADMIN role, redirect to home
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  const customerRoutes = ['/profile', '/orders', '/account', '/wishlist'];
  const isCustomerRoute = customerRoutes.some(route => pathname.startsWith(route));

  if (isCustomerRoute) {
    if (!token) {
      const url = new URL('/login', req.url);
      url.searchParams.set('callbackUrl', encodeURI(req.url));
      return NextResponse.redirect(url);
    }
    // Any logged in user (ADMIN or customer) can access their own profile/orders
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/profile/:path*', '/orders/:path*', '/account/:path*', '/wishlist/:path*'],
};
