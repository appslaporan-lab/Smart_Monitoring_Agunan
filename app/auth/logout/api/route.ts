import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/session';

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL('/', request.url));
  return clearAuthCookie(response);
}