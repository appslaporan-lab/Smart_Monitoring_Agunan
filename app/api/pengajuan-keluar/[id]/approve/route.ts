import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { appendAuditLog } from '@/lib/audit';
import { FINAL_STATUS_MAP } from '@/lib/pengajuan';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Anda harus login.' }, { status: 401 });

  const body = await request.json();
  const { keputusan, catatan } = body;

  const pengajuan = await prisma.pengajuanKeluar.findUnique({
    where: { id: Number(params.id) },
    include: { steps: { orderBy: { urutan: 'asc' } }, agunan: true },
  });

  if (!pengajuan) return NextResponse.json({ error: 'Pengajuan tidak ditemukan.' }, { status: 404 });
  if (pengajuan.status !== 'MENUNGGU') {
    return NextResponse.json({ error: 'Pengajuan sudah tidak aktif.' }, { status: 400 });
  }

  const currentStep = pengajuan.steps.find((s) => s.status === 'MENUNGGU');
  if (!currentStep) return NextResponse.json({ error: 'Tidak ada langkah menunggu.' }, { status: 400 });

  const allowedRoles = currentStep.rolesDiizinkan.split(',');
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json({ error: 'Anda tidak berwenang menyetujui langkah ini.' }, { status: 403 });
  }

  if (keputusan === 'tolak') {
    await prisma.pengajuanStep.update({
      where: { id: currentStep.id },
      data: { status: 'DISETUJUI', disetujuiOlehId: user.id, catatan: `DITOLAK: ${catatan || ''}` },
    });
    await prisma.pengajuanKeluar.update({ where: { id: pengajuan.id }, data: { status: 'DITOLAK' } });
    await prisma.agunan.update({ where: { id: pengajuan.agunanId }, data: { status: 'DI_BRANKAS' } });

    await appendAuditLog({
      agunanId: pengajuan.agunanId,
      agunanKodeRegister: pengajuan.agunan.kodeRegister,
      action: 'tolak_pengajuan',
      actor: `${user.nama} (${user.role})`,
      details: catatan || 'Tidak ada catatan',
    });

    return NextResponse.json({ success: true, status: 'DITOLAK' });
  }

  await prisma.pengajuanStep.update({
    where: { id: currentStep.id },
    data: { status: 'DISETUJUI', disetujuiOlehId: user.id, catatan },
  });

  const remainingSteps = pengajuan.steps.filter((s) => s.urutan > currentStep.urutan);

  await appendAuditLog({
    agunanId: pengajuan.agunanId,
    agunanKodeRegister: pengajuan.agunan.kodeRegister,
    action: 'setuju_langkah_pengajuan',
    actor: `${user.nama} (${user.role})`,
    details: `Langkah ${currentStep.urutan} disetujui. ${catatan || ''}`,
  });

  if (remainingSteps.length === 0) {
    const finalStatus = FINAL_STATUS_MAP[pengajuan.jenisPengajuan] || 'DISERAHKAN';
    await prisma.pengajuanKeluar.update({ where: { id: pengajuan.id }, data: { status: 'SELESAI' } });
    await prisma.agunan.update({ where: { id: pengajuan.agunanId }, data: { status: finalStatus } });

    await appendAuditLog({
      agunanId: pengajuan.agunanId,
      agunanKodeRegister: pengajuan.agunan.kodeRegister,
      action: 'selesai_pengajuan',
      actor: `${user.nama} (${user.role})`,
      details: `Status akhir: ${finalStatus}`,
    });

    return NextResponse.json({ success: true, status: 'SELESAI', finalStatus });
  }

  return NextResponse.json({ success: true, status: 'LANJUT_KE_LANGKAH_BERIKUTNYA' });
}