import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/auth/login', '/auth/register', '/auth/login/api', '/auth/register/api', '/auth/logout/api'];
const COOKIE_NAME = 'agunan_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'agunan-session-secret-2026-GANTI-DI-ENV-VERCEL';

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  return atob(base64);
}

async function verifySignature(payload: string, signature: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(SESSION_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sigBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const bytes = new Uint8Array(sigBuffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  const expectedSignature = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return expectedSignature === signature;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  if (isPublic) return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) throw new Error('invalid token');

    const valid = await verifySignature(payload, signature);
    if (!valid) throw new Error('invalid signature');

    const session = JSON.parse(base64UrlDecode(payload));

    if (session.exp < Math.floor(Date.now() / 1000)) {
      const loginUrl = new URL('/auth/login?error=Sesi+telah+berakhir', request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.set({ name: COOKIE_NAME, value: '', maxAge: 0, path: '/' });
      return response;
    }
  } catch {
    const loginUrl = new URL('/auth/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set({ name: COOKIE_NAME, value: '', maxAge: 0, path: '/' });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo-bpr.svg|logo-bpr-resmi.png).*)'],
};