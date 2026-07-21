import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/session';

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL('/auth/login?success=Anda+telah+logout', request.url));
  return clearAuthCookie(response);
}