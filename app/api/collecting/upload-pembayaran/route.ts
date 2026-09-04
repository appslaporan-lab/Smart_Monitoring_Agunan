import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

export async function POST(request: Request) {
  const user = getCurrentUser();
  if (!user || user.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { jenisUpload, data } = await request.json();

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: 'Tidak ada data valid yang diterima.' }, { status: 400 });
    }

    const periodeAktif = await prisma.periodeNominatif.findFirst({
      where: { jenisUpload: 'COLLECTING' },
      orderBy: [{ tahun: 'desc' }, { bulan: 'desc' }],
    });

    if (!periodeAktif) {
      return NextResponse.json({ error: 'Periode aktif tidak ditemukan' }, { status: 400 });
    }

    let updatedCount = 0;

    // Optimized update using transactions or bulk updates
    // Since prisma doesn't support bulk updates with dynamic values easily, we can use a loop or multiple updates.
    
    // We will find all PinjamanPeriode for this periode that match the norek array
    const noreks = data.map(d => d.norek);
    
    const pinjamansToUpdate = await prisma.pinjamanPeriode.findMany({
      where: { 
        periodeId: periodeAktif.id,
        norek: { in: noreks }
      },
      select: { id: true, norek: true }
    });

    const updatePromises = [];

    for (const p of pinjamansToUpdate) {
      const match = data.find(d => d.norek === p.norek);
      if (match) {
        updatePromises.push(
          prisma.pinjamanPeriode.update({
            where: { id: p.id },
            data: {
              sudahBayar: true,
              isLunas: match.isLunas,
              nominalBayarHariIni: match.totalBayar
            }
          })
        );
        updatedCount++;
      }
    }

    await prisma.$transaction(updatePromises);

    return NextResponse.json({ success: true, updated: updatedCount });
  } catch (error: any) {
    console.error('Upload Pembayaran Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
