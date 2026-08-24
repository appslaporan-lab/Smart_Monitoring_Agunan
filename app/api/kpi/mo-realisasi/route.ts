import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tanggal, nominal, keterangan, targetUserId, jenis, saldoAkhir, nominalAsli } = await req.json();

    if (!tanggal || nominal === undefined || nominal === null) {
      return NextResponse.json({ error: 'Tanggal dan nominal wajib diisi' }, { status: 400 });
    }

    let finalUserId = user.id;

    if (user.role === 'SUPERADMIN' && targetUserId) {
      finalUserId = parseInt(targetUserId, 10);
    }

    const newRecord = await prisma.realisasiHarianMO.create({
      data: {
        userId: finalUserId,
        tanggal: new Date(tanggal),
        nominal: parseFloat(nominal),
        jenis: jenis || 'BARU',
        saldoAkhir: saldoAkhir ? parseFloat(saldoAkhir) : 0,
        nominalAsli: nominalAsli ? parseFloat(nominalAsli) : parseFloat(nominal),
        keterangan: keterangan || '',
      }
    });

    return NextResponse.json({ success: true, data: newRecord });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const bulan = url.searchParams.get('bulan');
    const tahun = url.searchParams.get('tahun');

    if (!bulan || !tahun) {
      return NextResponse.json({ error: 'Bulan dan tahun wajib diisi' }, { status: 400 });
    }

    const startDate = new Date(parseInt(tahun), parseInt(bulan) - 1, 1);
    const endDate = new Date(parseInt(tahun), parseInt(bulan), 0, 23, 59, 59, 999);

    const records = await prisma.realisasiHarianMO.findMany({
      where: {
        tanggal: {
          gte: startDate,
          lte: endDate,
        }
      },
      include: {
        user: { select: { nama: true, subKantor: true, role: true } }
      }
    });

    return NextResponse.json({ success: true, data: records });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
