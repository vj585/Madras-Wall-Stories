import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req) {
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

  // Protect Admin API mutations centrally
  const adminApiRoutes = ['/api/products', '/api/orders', '/api/customers', '/api/coupons', '/api/banners', '/api/admin-users'];
  const isAdminApiRoute = adminApiRoutes.some(route => pathname.startsWith(route));

  if (isAdminApiRoute && req.method !== 'GET') {
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required' }, { status: 401 });
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
  matcher: ['/admin/:path*', '/profile/:path*', '/orders/:path*', '/account/:path*', '/wishlist/:path*', '/api/:path*'],
};
