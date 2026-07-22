import { NextResponse } from 'next/server';
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
  const { decision } = body;

  if (decision !== 'approve' && decision !== 'reject') {
    return NextResponse.json({ error: 'Keputusan tidak valid.' }, { status: 400 });
  }

  const targetUser = await prisma.user.findUnique({ where: { id: Number(params.id) } });
  if (!targetUser) return NextResponse.json({ error: 'User tidak ditemukan.' }, { status: 404 });

  const updated = await prisma.user.update({
    where: { id: Number(params.id) },
    data: { status: decision === 'approve' ? 'APPROVED' : 'REJECTED' },
  });

  await appendAuditLog({
    action: decision === 'approve' ? 'approve_user' : 'reject_user',
    actor: `${currentUser.nama} (${currentUser.role})`,
    details: `User: ${targetUser.username} (${targetUser.role})`,
  });

  return NextResponse.json(updated);
}