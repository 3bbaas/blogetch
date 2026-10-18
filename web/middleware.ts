import { NextResponse, type NextRequest } from 'next/server';
import { TOKEN_COOKIE } from './src/lib/auth-cookie';

const PROTECTED_PREFIXES = ['/write', '/desk'];

function isEditPath(pathname: string): boolean {
  return pathname.startsWith('/blogs/') && pathname.endsWith('/edit');
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;
  const needsAuth =
    PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)) ||
    isEditPath(pathname);
  if (!needsAuth) return NextResponse.next();
  if (request.cookies.has(TOKEN_COOKIE)) return NextResponse.next();
  const login = new URL('/login', request.url);
  login.searchParams.set('next', `${pathname}${search}`);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ['/write/:path*', '/desk/:path*', '/blogs/:path*/edit'],
};
