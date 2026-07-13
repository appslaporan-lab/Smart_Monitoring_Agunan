import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionFromCookie } from '@/lib/session';

const protectedRoutes = ['/create', '/nasabah', '/agunan'];
const createAllowedRoles = [
  'ADM_KREDIT_PUSAT',
  'ADM_KREDIT_CABANG',
  'KABAG_OPERASIONAL',
  'PIMPINAN_CABANG',
  'DIREKTUR',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const user = getSessionFromCookie(request);

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('error', 'Silakan login terlebih dahulu');
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith('/create') && !createAllowedRoles.includes(user.role)) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('error', 'Akses dilarang untuk role Anda');
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/create/:path*', '/nasabah/:path*', '/agunan/:path*'],
};
