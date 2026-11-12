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

    if (pengajuan.status !== 'PENDING_VERIFIKASI') {
      return NextResponse.json({ error: 'Pengajuan tidak dalam status PENDING VERIFIKASI' }, { status: 400 });
    }

    const body = await request.json();
    const { action, catatan } = body; // action: 'SETUJU' | 'TOLAK'

    if (!['SETUJU', 'TOLAK'].includes(action)) {
      return NextResponse.json({ error: 'Aksi verifikasi tidak valid' }, { status: 400 });
    }

    // Role check:
    // "Khusus Kas Pusat & Kas Campurdarat ditangani Kasubag Kredit, kantor kas lain ditangani Kepala Kas."
    const sub = (pengajuan.subKantor || '').toUpperCase();
    const isKasPusat = sub.includes('01') || sub.includes('PUSAT');
    const isKasCampurdarat = sub.includes('02') || sub.includes('CAMPURDARAT');

    if (user.role !== 'SUPERADMIN') {
      if (isKasPusat || isKasCampurdarat) {
        if (!user.role.includes('KASUBAG_KREDIT')) {
          return NextResponse.json({
            error: 'Verifikasi untuk Kas Pusat dan Kas Campurdarat khusus ditangani oleh Kasubag Kredit.',
          }, { status: 403 });
        }
      } else {
        if (user.role !== 'KEPALA_KAS') {
          return NextResponse.json({
            error: 'Verifikasi untuk kantor kas ini ditangani oleh Kepala Kas.',
          }, { status: 403 });
        }
      }
    }

    const updated = await prisma.pengajuanRab.update({
      where: { id },
      data: {
        status: action === 'SETUJU' ? 'DISETUJUI_RAB' : 'DITOLAK',
        catatanPenolakan: action === 'TOLAK' ? (catatan || 'Ditolak oleh Checker') : null,
        checkerId: user.id,
        checkerNama: user.nama,
        checkerRole: user.role,
        checkerCatatan: catatan || '',
        waktuChecker: new Date(),
      },
    });

    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          username: user.username,
          role: user.role,
          action: action === 'SETUJU' ? 'CHECKER_APPROVE_RAB' : 'CHECKER_REJECT_RAB',
          entity: 'PengajuanRab',
          entityId: String(id),
          details: `Checker ${user.nama} (${user.role}) ${action === 'SETUJU' ? 'menyetujui' : 'menolak'} pengajuan RAB ${pengajuan.nomorPengajuan}`,
        },
      });
    } catch (e) {
      console.error('Activity log error:', e);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error in checker verify:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
