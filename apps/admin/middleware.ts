import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect admin routes under /admin
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Allow login page and static assets
  if (pathname === '/admin/login' || pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Forward cookies to our API to validate session & role
  const cookie = req.headers.get('cookie') || '';
  try {
    const res = await fetch(`${req.nextUrl.origin}/api/auth/me`, {
      headers: {
        cookie
      },
      // ensure same-origin credentials are used
      credentials: 'include'
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.isAdmin) {
        return NextResponse.next();
      }
    }
  } catch (e) {
    // fallthrough to redirect
  }

  const loginPath = process.env.ADMIN_LOGIN_PATH || '/admin/login';
  const loginUrl = new URL(loginPath, req.nextUrl.origin);
  // attach returnUrl so client can redirect back after login
  loginUrl.searchParams.set('returnUrl', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*', '/admin']
};

