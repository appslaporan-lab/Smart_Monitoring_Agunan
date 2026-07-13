import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'agunan_session';
const MAX_AGE = 60 * 60 * 24 * 7;

type SessionPayload = {
  id: number;
  nama: string;
  email: string;
  role: string;
  exp: number;
};

const encodeSession = (session: SessionPayload) => {
  return Buffer.from(JSON.stringify(session)).toString('base64url');
};

const decodeSession = (token: string): SessionPayload | null => {
  try {
    return JSON.parse(Buffer.from(token, 'base64url').toString('utf-8')) as SessionPayload;
  } catch {
    return null;
  }
};

export const setAuthCookie = (response: NextResponse, session: Omit<SessionPayload, 'exp'>) => {
  const token = encodeSession({ ...session, exp: Math.floor(Date.now() / 1000) + MAX_AGE });
  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: MAX_AGE,
  });
  return response;
};

export const clearAuthCookie = (response: NextResponse) => {
  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    path: '/',
    maxAge: 0,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return response;
};

const getSessionFromToken = (token: string | undefined) => {
  if (!token) return null;
  const session = decodeSession(token);
  if (!session) return null;
  if (session.exp < Math.floor(Date.now() / 1000)) return null;
  return session;
};

export const getSessionFromCookie = (request?: NextRequest) => {
  const cookieStore = request ? request.cookies : cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return getSessionFromToken(token);
};

export const getCurrentUser = () => {
  return getSessionFromCookie();
};

export const parseSessionToken = (token: string) => {
  return decodeSession(token);
};
