import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import crypto from 'crypto';

const COOKIE_NAME = 'agunan_session';
const MAX_AGE = 60 * 60 * 24 * 7;
const SESSION_SECRET = process.env.SESSION_SECRET || 'agunan-session-secret-2026-GANTI-DI-ENV-VERCEL';

type SessionPayload = {
  id: number;
  nama: string;
  username: string;
  role: string;
  exp: number;
};

const sign = (data: string) => {
  return crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
};

const encodeSession = (session: SessionPayload) => {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  const signature = sign(payload);
  return `${payload}.${signature}`;
};

const decodeSession = (token: string): SessionPayload | null => {
  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return null;

    const expectedSignature = sign(payload);
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expBuf.length) return null;
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;

    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as SessionPayload;
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