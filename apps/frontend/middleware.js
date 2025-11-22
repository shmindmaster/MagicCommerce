
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();
  
  try {
    const token = req.cookies.get('auth-token');
    let isAuthenticated = !!token; // Simple check for token existence

    if (isAuthenticated && req.nextUrl.pathname.startsWith('/auth')) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Must be authenticated to see these routes
    if (
      !isAuthenticated && (
        req.nextUrl.pathname.startsWith('/checkout') ||
        req.nextUrl.pathname.startsWith('/success') ||
        req.nextUrl.pathname.startsWith('/orders') ||
        req.nextUrl.pathname.startsWith('/address')
      )
    ) {
      return NextResponse.redirect(new URL('/auth', req.url));
    }

    return res;
  } catch (error) {
    // Invalid token, redirect to auth for protected routes
    if (
      req.nextUrl.pathname.startsWith('/checkout') ||
      req.nextUrl.pathname.startsWith('/success') ||
      req.nextUrl.pathname.startsWith('/orders') ||
      req.nextUrl.pathname.startsWith('/address')
    ) {
      return NextResponse.redirect(new URL('/auth', req.url));
    }
    return res;
  }
}
