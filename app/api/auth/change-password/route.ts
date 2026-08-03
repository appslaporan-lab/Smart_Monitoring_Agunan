import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/auth';

export async function POST(request: Request) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Anda harus login.' }, { status: 401 });
  }

  const body = await request.json();
  const currentPassword = body.currentPassword?.toString() || '';
  const newPassword = body.newPassword?.toString() || '';

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Password lama dan baru wajib diisi.' }, { status: 400 });
  }

  if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
    return NextResponse.json({ error: 'Password minimal 8 karakter dan harus ada huruf serta angka.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: currentUser.id } });
  if (!user) {
    return NextResponse.json({ error: 'User tidak ditemukan.' }, { status: 404 });
  }

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: 'Password saat ini salah.' }, { status: 400 });
  }

  const newPasswordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: currentUser.id },
    data: {
      passwordHash: newPasswordHash,
      passwordChangedAt: new Date(),
    },
  });

  return NextResponse.json({ message: 'Password berhasil diubah.' });
}
