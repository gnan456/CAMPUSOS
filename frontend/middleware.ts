import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Edge Middleware for route protection.
 * - Redirects unauthenticated users away from /dashboard
 * - Redirects authenticated users away from /login and /register
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // We use the 'refreshToken' cookie presence as a hint that the user is logged in.
  // The actual access token is held in memory by the frontend.
  // If the refresh token is invalid, the AuthProvider on the client will catch it and log them out.
  const hasRefreshToken = request.cookies.has('refreshToken');

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isProtectedRoute = pathname.startsWith('/dashboard');

  if (isProtectedRoute && !hasRefreshToken) {
    const loginUrl = new URL('/login', request.url);
    // loginUrl.searchParams.set('from', pathname); // Optional: redirect back after login
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && hasRefreshToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
