import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { canAccessKantorData } from '@/lib/kantor';

export async function GET(request: Request) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const periodeAktif = await prisma.periodeNominatif.findFirst({
    where: { jenisUpload: 'COLLECTING' },
    orderBy: [{ tahun: 'desc' }, { bulan: 'desc' }],
  });

  if (!periodeAktif) return NextResponse.json([]);

  const pinjamans = await prisma.pinjamanPeriode.findMany({
    where: { periodeId: periodeAktif.id },
    select: {
      id: true,
      norek: true,
      namaNasabahExcel: true,
      subKantor: true,
      namaAO: true,
      hariTunggakan: true,
      alamatExcel: true,
      noTelepon: true,
      sudahBayar: true,
      isLunas: true,
      tunggakanPokok: true,
      tunggakanBunga: true,
    }
  });

  const visiblePinjamans = pinjamans.filter((p) => {
    if (p.sudahBayar || p.isLunas) return false;
    return canAccessKantorData(user.role, user.kantor, user.subKantor, p.subKantor);
  });

  return NextResponse.json(visiblePinjamans);
}

export async function POST(request: Request) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const payloads = await request.json();
    if (!Array.isArray(payloads)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const results = [];

    for (const item of payloads) {
      const {
        pinjamanPeriodeId,
        tanggalKunjungan,
        jenisKontak,
        hasil,
        nominalDibayar,
        tanggalJanjiBayar,
        catatan,
        penerimaSurat,
        fotoDataUrl
      } = item;

      const kunjungan = await prisma.kunjunganPenagihan.create({
        data: {
          pinjamanPeriodeId,
          petugasId: user.id,
          tanggalKunjungan: new Date(tanggalKunjungan),
          jenisKontak,
          hasil,
          nominalDibayar: nominalDibayar ? parseFloat(nominalDibayar) : null,
          tanggalJanjiBayar: tanggalJanjiBayar ? new Date(tanggalJanjiBayar) : null,
          catatan,
          penerimaSurat,
          fotoDataUrl,
        }
      });

      if (hasil === 'LUNAS') {
        await prisma.pinjamanPeriode.update({
          where: { id: pinjamanPeriodeId },
          data: { isLunas: true, sudahBayar: true, nominalBayarHariIni: nominalDibayar ? parseFloat(nominalDibayar) : null }
        });
      } else if (hasil === 'BAYAR_SEBAGIAN') {
        await prisma.pinjamanPeriode.update({
          where: { id: pinjamanPeriodeId },
          data: { sudahBayar: true, nominalBayarHariIni: nominalDibayar ? parseFloat(nominalDibayar) : null }
        });
      }
      
      results.push(kunjungan.id);
    }

    return NextResponse.json({ success: true, processed: results.length });
  } catch (error: any) {
    console.error('Offline Sync Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
