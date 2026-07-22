import { NextResponse } from 'next/server';
import { findUserByUsername, verifyPassword } from '@/lib/auth';
import { setAuthCookie } from '@/lib/session';
import { verifyCaptcha } from '@/lib/captcha';

export async function POST(request: Request) {
  const form = await request.formData();
  const username = form.get('username');
  const password = form.get('password');
  const captchaAnswer = form.get('captchaAnswer');
  const captchaToken = form.get('captchaToken');

  if (!username || !password) {
    return NextResponse.redirect(new URL('/auth/login?error=Username+atau+password+tidak+boleh+kosong', request.url));
  }

  if (!captchaToken || !captchaAnswer || !verifyCaptcha(captchaToken.toString(), captchaAnswer.toString())) {
    return NextResponse.redirect(new URL('/auth/login?error=Jawaban+verifikasi+salah+atau+kedaluwarsa,+silakan+coba+lagi', request.url));
  }

  const user = await findUserByUsername(username.toString());
  if (!user) {
    return NextResponse.redirect(new URL('/auth/login?error=Username+tidak+ditemukan', request.url));
  }

  const passwordValid = await verifyPassword(password.toString(), user.passwordHash);
  if (!passwordValid) {
    return NextResponse.redirect(new URL('/auth/login?error=Password+salah', request.url));
  }

  if (user.status === 'PENDING') {
    return NextResponse.redirect(new URL('/auth/login?error=Akun+Anda+masih+menunggu+persetujuan+Superadmin', request.url));
  }
  if (user.status === 'REJECTED') {
    return NextResponse.redirect(new URL('/auth/login?error=Akun+Anda+ditolak.+Hubungi+Superadmin', request.url));
  }

  const response = NextResponse.redirect(new URL('/?success=Login+berhasil', request.url));
  return setAuthCookie(response, {
    id: user.id,
    nama: user.nama,
    username: user.username,
    role: user.role,
  });
}