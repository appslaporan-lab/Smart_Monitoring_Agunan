import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { getKantorGroup } from '@/lib/kantor';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const subKantor = searchParams.get('subKantor');
  const search = searchParams.get('search');
  const tab = searchParams.get('tab');

  try {
    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (subKantor && subKantor !== 'ALL') {
      where.subKantor = subKantor;
    }

    if (tab === 'tab1_mo') {
      // Show submissions created by this user, unless superadmin
      if (user.role !== 'SUPERADMIN') {
        where.pemohonId = user.id;
      }
    } else if (tab === 'tab2_checker') {
      where.status = 'PENDING_VERIFIKASI';
    } else if (tab === 'tab3_signer') {
      where.status = 'DISETUJUI_RAB';
    } else if (tab === 'tab4_teller') {
      where.status = 'MENUNGGU_INPUT_TELLER';
    }

    if (search) {
      const q = search.trim();
      where.OR = [
        { norek: { contains: q, mode: 'insensitive' } },
        { namaNasabah: { contains: q, mode: 'insensitive' } },
        { nomorPengajuan: { contains: q, mode: 'insensitive' } },
        { nomorRab: { contains: q, mode: 'insensitive' } },
      ];
    }

    const items = await prisma.pengajuanRab.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    // Also get counts for each tab for badges
    const [countPendingChecker, countDisetujuiSigner, countMenungguTeller, countSudahInput, countTotal] = await Promise.all([
      prisma.pengajuanRab.count({ where: { status: 'PENDING_VERIFIKASI' } }),
      prisma.pengajuanRab.count({ where: { status: 'DISETUJUI_RAB' } }),
      prisma.pengajuanRab.count({ where: { status: 'MENUNGGU_INPUT_TELLER' } }),
      prisma.pengajuanRab.count({ where: { status: 'SUDAH_INPUT' } }),
      prisma.pengajuanRab.count(),
    ]);

    return NextResponse.json({
      items,
      counts: {
        pendingChecker: countPendingChecker,
        disetujuiSigner: countDisetujuiSigner,
        menungguTeller: countMenungguTeller,
        sudahInput: countSudahInput,
        total: countTotal,
      },
    });
  } catch (error: any) {
    console.error('Error fetching Pengajuan RAB:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Only authorized submitters (MO, Marketing, AO, Superadmin)
  const allowedSubmitters = ['MO', 'MARKETING', 'AO', 'SUPERADMIN'];
  if (!allowedSubmitters.some((r) => user.role.includes(r))) {
    return NextResponse.json({ error: 'Hanya peran MO/Marketing/AO yang dapat menginput pengajuan RAB.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { pinjamanPeriodeId, norek, namaNasabah, subKantor, nominal, keterangan, fotoResiUrl } = body;

    if (!norek || !namaNasabah || !subKantor || !nominal) {
      return NextResponse.json({ error: 'Mohon lengkapi semua data wajib: Nasabah (Norek), Kantor Kas, dan Nominal.' }, { status: 400 });
    }

    if (!fotoResiUrl) {
      return NextResponse.json({ error: 'Bukti resi/transfer/setoran wajib diunggah.' }, { status: 400 });
    }

    // Generate unique nomorPengajuan: REQ-RAB-YYYYMMDD-XXXX
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const countToday = await prisma.pengajuanRab.count({
      where: {
        nomorPengajuan: {
          startsWith: `REQ-RAB-${dateStr}`,
        },
      },
    });
    const seq = String(countToday + 1).padStart(4, '0');
    const nomorPengajuan = `REQ-RAB-${dateStr}-${seq}`;

    const kantorGroup = getKantorGroup(subKantor) || 'CABANG';

    const pengajuan = await prisma.pengajuanRab.create({
      data: {
        nomorPengajuan,
        pinjamanPeriodeId: pinjamanPeriodeId ? Number(pinjamanPeriodeId) : null,
        norek: String(norek).trim(),
        namaNasabah: String(namaNasabah).trim(),
        subKantor: String(subKantor).trim(),
        kantorGroup,
        nominal: Number(nominal) || 0,
        keterangan: keterangan || '',
        fotoResiUrl,
        status: 'PENDING_VERIFIKASI',
        pemohonId: user.id,
        pemohonNama: user.nama,
        pemohonRole: user.role,
        waktuPengajuan: new Date(),
      },
    });

    // Log Activity
    try {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          username: user.username,
          role: user.role,
          action: 'INPUT_PENGAJUAN_RAB',
          entity: 'PengajuanRab',
          entityId: String(pengajuan.id),
          details: `Mengajukan RAB ${nomorPengajuan} untuk nasabah ${namaNasabah} (${norek}) sebesar Rp ${Number(nominal).toLocaleString('id-ID')}`,
        },
      });
    } catch (e) {
      console.error('Activity log error:', e);
    }

    return NextResponse.json({ success: true, data: pengajuan });
  } catch (error: any) {
    console.error('Error create pengajuan RAB:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
