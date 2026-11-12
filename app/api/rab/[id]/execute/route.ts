import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });

  try {
    const pengajuan = await prisma.pengajuanRab.findUnique({ where: { id } });
    if (!pengajuan) {
      return NextResponse.json({ error: 'Pengajuan RAB tidak ditemukan' }, { status: 404 });
    }

    if (pengajuan.status !== 'MENUNGGU_INPUT_TELLER') {
      return NextResponse.json({ error: 'Pengajuan belum dalam status MENUNGGU INPUT TELLER.' }, { status: 400 });
    }

    const body = await request.json();
    const { tellerNama, noValidasiCbs, catatanTeller } = body;

    if (!noValidasiCbs || !noValidasiCbs.trim()) {
      return NextResponse.json({ error: 'Nomor Validasi Kas CBS wajib diisi.' }, { status: 400 });
    }

    // Role check: Teller or Superadmin
    if (user.role !== 'SUPERADMIN' && user.role !== 'TELLER') {
      return NextResponse.json({ error: 'Hanya peran Teller atau Superadmin yang berwenang mengeksekusi input CBS.' }, { status: 403 });
    }

    const finalTellerNama = (tellerNama && tellerNama.trim()) || user.nama;

    const updated = await prisma.pengajuanRab.update({
      where: { id },
      data: {
        status: 'SUDAH_INPUT',
        tellerId: user.id,
        tellerNama: finalTellerNama,
        noValidasiCbs: noValidasiCbs.trim(),
        catatanTeller: catatanTeller || '',
        waktuTeller: new Date(),
      },
    });

    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          username: user.username,
          role: user.role,
          action: 'TELLER_EXECUTE_RAB',
          entity: 'PengajuanRab',
          entityId: String(id),
          details: `Teller ${finalTellerNama} menyelesaikan input RAB ${pengajuan.nomorRab || pengajuan.nomorPengajuan} dengan No. Validasi CBS: ${noValidasiCbs}`,
        },
      });
    } catch (e) {
      console.error('Activity log error:', e);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error in teller execution:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
