import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { determineSteps, ALLOWED_SUBMITTERS } from '@/lib/pengajuan';
import { appendAuditLog } from '@/lib/audit';

export async function POST(request: Request) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Anda harus login.' }, { status: 401 });

  const body = await request.json();
  const { agunanId, jenisPengajuan, catatan } = body;

  if (!agunanId || !jenisPengajuan) {
    return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 });
  }

  const validSubmitters = ALLOWED_SUBMITTERS[jenisPengajuan];
  if (validSubmitters && !validSubmitters.includes(user.role)) {
    return NextResponse.json({ error: 'Role Anda tidak berwenang mengajukan jenis ini.' }, { status: 403 });
  }

  try {
    const agunan = await prisma.agunan.findUnique({ where: { id: Number(agunanId) } });
    if (!agunan) return NextResponse.json({ error: 'Agunan tidak ditemukan.' }, { status: 404 });
    if (agunan.status !== 'DI_BRANKAS') {
      return NextResponse.json({ error: 'Agunan tidak dalam status Di Brankas.' }, { status: 400 });
    }

    const steps = determineSteps(jenisPengajuan, user.role as any);

    const pengajuan = await prisma.pengajuanKeluar.create({
      data: {
        agunanId: Number(agunanId),
        jenisPengajuan,
        diajukanOlehId: user.id,
        catatan,
        status: steps.length === 0 ? 'SELESAI' : 'MENUNGGU',
        steps: {
          create: steps.map((s, idx) => ({ urutan: idx + 1, rolesDiizinkan: s.rolesDiizinkan })),
        },
      },
      include: { steps: true },
    });

    await prisma.agunan.update({
      where: { id: Number(agunanId) },
      data: { status: 'PROSES_KELUAR', tanggalKeluarBrankas: new Date() },
    });

    await appendAuditLog({
      agunanId: agunan.id,
      agunanKodeRegister: agunan.kodeRegister,
      action: `ajukan_${jenisPengajuan.toLowerCase()}`,
      actor: `${user.nama} (${user.role})`,
      details: catatan || 'Tidak ada catatan',
    });

    return NextResponse.json(pengajuan);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal membuat pengajuan.' }, { status: 500 });
  }
}