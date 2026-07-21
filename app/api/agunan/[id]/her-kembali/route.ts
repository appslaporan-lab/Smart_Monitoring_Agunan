import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { appendAuditLog } from '@/lib/audit';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Anda harus login.' }, { status: 401 });

  const body = await request.json();
  const { jenisKembali } = body;

  const agunan = await prisma.agunan.findUnique({ where: { id: Number(params.id) } });
  if (!agunan) return NextResponse.json({ error: 'Agunan tidak ditemukan.' }, { status: 404 });

  const isSTNK = jenisKembali === 'STNK';
  const nextStatus = isSTNK ? 'HER_5_TAHUNAN' : 'DI_BRANKAS';
  const warning = isSTNK
    ? 'STNK/Notice sudah kembali. BPKB baru masih diproses di Samsat, estimasi 3 bulan.'
    : null;

  const updated = await prisma.agunan.update({
    where: { id: Number(params.id) },
    data: {
      status: nextStatus,
      warningPesan: warning,
      tanggalKeluarBrankas: isSTNK ? agunan.tanggalKeluarBrankas : null,
    },
  });

  await appendAuditLog({
    agunanId: agunan.id,
    agunanKodeRegister: agunan.kodeRegister,
    action: 'her_kembali',
    actor: `${user.nama} (${user.role})`,
    details: `Yang kembali: ${jenisKembali === 'STNK' ? 'STNK/Notice' : 'BPKB'}. Status baru: ${nextStatus}`,
  });

  return NextResponse.json(updated);
}