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
      kunjunganPenagihan: {
        select: { id: true, hasil: true, tanggalJanjiBayar: true },
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const visiblePinjamans = pinjamans.filter((p) => {
    if (p.sudahBayar || p.isLunas) return false;
    
    let isOverduePromise = false;
    if (p.kunjunganPenagihan && p.kunjunganPenagihan.length > 0) {
      const last = p.kunjunganPenagihan[0];
      if (last.hasil === 'JANJI_BAYAR' && last.tanggalJanjiBayar) {
        const janjiDate = new Date(last.tanggalJanjiBayar);
        janjiDate.setHours(0, 0, 0, 0);
        if (today > janjiDate) {
          isOverduePromise = true;
        }
      }
      if (!isOverduePromise) return false;
    }

    if (isOverduePromise) {
      (p as any).isOverduePromise = true;
    }

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
