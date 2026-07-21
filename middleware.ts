import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/auth/login', '/auth/register', '/auth/login/api', '/auth/register/api', '/auth/logout/api'];

const COOKIE_NAME = 'agunan_session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  if (isPublic) return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const session = JSON.parse(Buffer.from(token, 'base64url').toString('utf-8'));
    if (session.exp < Math.floor(Date.now() / 1000)) {
      const loginUrl = new URL('/auth/login?error=Sesi+telah+berakhir', request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.set({ name: COOKIE_NAME, value: '', maxAge: 0, path: '/' });
      return response;
    }
  } catch {
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo-bpr.svg|logo-bpr-resmi.png).*)'],
};