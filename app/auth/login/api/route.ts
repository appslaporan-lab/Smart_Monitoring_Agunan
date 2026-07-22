import { NextResponse } from 'next/server';
import { findUserByUsername, verifyPassword } from '@/lib/auth';
import { setAuthCookie } from '@/lib/session';
import { verifyCaptcha } from '@/lib/captcha';
import { prisma } from '@/lib/prisma';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

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

  if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
    const minutesLeft = Math.ceil((new Date(user.lockedUntil).getTime() - Date.now()) / 60000);
    return NextResponse.redirect(new URL(`/auth/login?error=Akun+terkunci+sementara+karena+terlalu+banyak+percobaan+gagal.+Coba+lagi+dalam+${minutesLeft}+menit`, request.url));
  }

  const passwordValid = await verifyPassword(password.toString(), user.passwordHash);
  if (!passwordValid) {
    const newAttempts = user.failedLoginAttempts + 1;
    const shouldLock = newAttempts >= MAX_ATTEMPTS;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: shouldLock ? 0 : newAttempts,
        lockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000) : null,
      },
    });

    if (shouldLock) {
      return NextResponse.redirect(new URL(`/auth/login?error=Terlalu+banyak+percobaan+gagal.+Akun+dikunci+selama+${LOCKOUT_MINUTES}+menit`, request.url));
    }

    const attemptsLeft = MAX_ATTEMPTS - newAttempts;
    return NextResponse.redirect(new URL(`/auth/login?error=Password+salah.+Sisa+percobaan:+${attemptsLeft}`, request.url));
  }

  if (user.status === 'PENDING') {
    return NextResponse.redirect(new URL('/auth/login?error=Akun+Anda+masih+menunggu+persetujuan+Superadmin', request.url));
  }
  if (user.status === 'REJECTED') {
    return NextResponse.redirect(new URL('/auth/login?error=Akun+Anda+ditolak.+Hubungi+Superadmin', request.url));
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });

  const response = NextResponse.redirect(new URL('/?success=Login+berhasil', request.url));
  return setAuthCookie(response, {
    id: user.id,
    nama: user.nama,
    username: user.username,
    role: user.role,
  });
}