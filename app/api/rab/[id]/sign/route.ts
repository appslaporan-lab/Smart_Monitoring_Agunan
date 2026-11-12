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

    if (pengajuan.status !== 'DISETUJUI_RAB') {
      return NextResponse.json({ error: 'Pengajuan harus berstatus DISETUJUI (SIAP PROSES RAB) terlebih dahulu.' }, { status: 400 });
    }

    const body = await request.json();
    const { nomorRab, action, catatan } = body;

    if (action === 'TOLAK') {
      const updated = await prisma.pengajuanRab.update({
        where: { id },
        data: {
          status: 'DITOLAK',
          catatanPenolakan: catatan || 'Ditolak oleh Signer RAB',
          signerId: user.id,
          signerNama: user.nama,
          signerRole: user.role,
          waktuSigner: new Date(),
        },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    if (!nomorRab || !nomorRab.trim()) {
      return NextResponse.json({ error: 'Nomor RAB wajib diisi.' }, { status: 400 });
    }

    const cleanNomorRab = nomorRab.trim().toUpperCase();
    const isPusat = pengajuan.kantorGroup === 'PUSAT_1' || pengajuan.kantorGroup === 'PUSAT_2';

    // Validate prefix
    if (isPusat && !cleanNomorRab.startsWith('RAB-PST-')) {
      return NextResponse.json({ error: 'Nomor RAB untuk wilayah Pusat 1 & 2 harus berawalan RAB-PST-' }, { status: 400 });
    }
    if (!isPusat && !cleanNomorRab.startsWith('RAB-CPD-')) {
      return NextResponse.json({ error: 'Nomor RAB untuk wilayah Cabang harus berawalan RAB-CPD-' }, { status: 400 });
    }

    // Role check:
    // "Wilayah Pusat 1 & 2 diproses oleh Akunting Pusat. Wilayah Cabang Campurdarat diproses oleh Kasubag Operasional Cabang."
    if (user.role !== 'SUPERADMIN') {
      if (isPusat) {
        const allowedPusat = ['AKUNTING_PUSAT', 'KASUBAG_PUSAT', 'KABAG_OPERASIONAL'];
        if (!allowedPusat.includes(user.role)) {
          return NextResponse.json({
            error: 'Penerbitan RAB wilayah Pusat 1 & 2 diproses oleh Akunting Pusat atau Kasubag Operasional Pusat.',
          }, { status: 403 });
        }
      } else {
        const allowedCabang = ['KASUBAG_CABANG', 'PIMPINAN_CABANG', 'KABAG_OPERASIONAL'];
        if (!allowedCabang.includes(user.role)) {
          return NextResponse.json({
            error: 'Penerbitan RAB wilayah Cabang diproses oleh Kasubag Operasional Cabang.',
          }, { status: 403 });
        }
      }
    }

    // Check if nomor RAB already exists
    const existing = await prisma.pengajuanRab.findFirst({
      where: { nomorRab: cleanNomorRab, id: { not: id } },
    });
    if (existing) {
      return NextResponse.json({ error: `Nomor RAB ${cleanNomorRab} sudah pernah digunakan.` }, { status: 400 });
    }

    const updated = await prisma.pengajuanRab.update({
      where: { id },
      data: {
        nomorRab: cleanNomorRab,
        status: 'MENUNGGU_INPUT_TELLER',
        signerId: user.id,
        signerNama: user.nama,
        signerRole: user.role,
        waktuSigner: new Date(),
      },
    });

    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          username: user.username,
          role: user.role,
          action: 'SIGNER_ISSUE_RAB',
          entity: 'PengajuanRab',
          entityId: String(id),
          details: `Signer ${user.nama} menerbitkan Nomor RAB ${cleanNomorRab} untuk pengajuan ${pengajuan.nomorPengajuan}`,
        },
      });
    } catch (e) {
      console.error('Activity log error:', e);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error in signer issue RAB:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
