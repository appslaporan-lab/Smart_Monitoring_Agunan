import { NextResponse } from 'next/server';
import { hashPassword, updateUserPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { appendAuditLog } from '@/lib/audit';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const currentUser = getCurrentUser();
  if (!currentUser) return NextResponse.json({ error: 'Anda harus login.' }, { status: 401 });
  if (currentUser.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Hanya Superadmin yang bisa melakukan aksi ini.' }, { status: 403 });
  }

  const body = await request.json();
  const { newPassword } = body;

  if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 8) {
    return NextResponse.json({ error: 'Password minimal 8 karakter.' }, { status: 400 });
  }

  const targetUser = await prisma.user.findUnique({ where: { id: Number(params.id) } });
  if (!targetUser) return NextResponse.json({ error: 'User tidak ditemukan.' }, { status: 404 });

  const passwordHash = await hashPassword(newPassword.trim());
  await updateUserPassword(Number(params.id), passwordHash);

  await appendAuditLog({
    action: 'reset_password',
    actor: `${currentUser.nama} (${currentUser.role})`,
    details: `User: ${targetUser.username} (${targetUser.role})`,
  });

  return NextResponse.json({ success: true, username: targetUser.username });
}
