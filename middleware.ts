import { NextRequest, NextResponse } from 'next/server';

// Routes under /admin that don't need auth
const PUBLIC_ADMIN_PATHS = ['/admin/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only intercept /admin/* routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('verde_admin_token')?.value;
  const isPublicAdminPath = PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p));

  // If trying to reach /admin/login while already authenticated → redirect to dashboard
  if (isPublicAdminPath && token) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // If trying to reach a protected admin page without a token → redirect to login
  if (!isPublicAdminPath && !token) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
