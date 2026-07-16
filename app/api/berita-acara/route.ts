import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const body = await request.json();
  const {
    agunanId,
    nomorDokumen,
    nomorRegister,
    namaNasabah,
    alamat,
    nomorRekening,
    tanggalLunas,
    jenisAgunan,
    photoDataUrl,
    ttdAdmKredit,
    ttdYangMenyerahkan,
    ttdYangMenerima,
    ttdMengetahui,
  } = body;

  if (!agunanId || !nomorDokumen || !nomorRegister || !namaNasabah || !jenisAgunan || !ttdYangMenyerahkan || !ttdMengetahui || !ttdYangMenerima) {
    return NextResponse.json({ error: 'Data berita acara tidak lengkap.' }, { status: 400 });
  }

  try {
    const created = await prisma.beritaAcara.create({
      data: {
        agunanId: Number(agunanId),
        nomorDokumen,
        nomorRegister,
        namaNasabah,
        alamat,
        nomorRekening,
        tanggalLunas: tanggalLunas ? new Date(tanggalLunas) : null,
        jenisAgunan,
        photoDataUrl,
        ttdAdmKredit: ttdAdmKredit || '',
        ttdYangMenyerahkan: ttdYangMenyerahkan || '',
        ttdYangMenerima: ttdYangMenerima || '',
        ttdMengetahui: ttdMengetahui || '',
      },
    });

    return NextResponse.json(created);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal menyimpan berita acara.' }, { status: 500 });
  }
}
