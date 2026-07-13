import { NextResponse } from 'next/server';
import { findUserByEmail, verifyPassword } from '@/lib/auth';
import { setAuthCookie } from '@/lib/session';

export async function POST(request: Request) {
  const form = await request.formData();
  const email = form.get('email');
  const password = form.get('password');

  if (!email || !password) {
    return NextResponse.redirect(new URL('/auth/login?error=Email+atau+password+tidak+boleh+kosong', request.url));
  }

  const user = await findUserByEmail(email.toString());
  if (!user) {
    return NextResponse.redirect(new URL('/auth/login?error=Email+tidak+ditemukan', request.url));
  }

  const passwordValid = await verifyPassword(password.toString(), user.passwordHash);
  if (!passwordValid) {
    return NextResponse.redirect(new URL('/auth/login?error=Password+salah', request.url));
  }

  const response = NextResponse.redirect(new URL('/?success=Login+berhasil', request.url));
  return setAuthCookie(response, {
    id: user.id,
    nama: user.nama,
    email: user.email,
    role: user.role,
  });
}
