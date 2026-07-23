import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const body = await request.json();
  const {
    nomorDokumen, namaNasabah, alamat, nomorRekening, tanggalLunas,
    daftarAgunan, photoDataUrl,
    ttdAdmKredit, ttdYangMenyerahkan, ttdYangMenerima, ttdMengetahui,
    ttdAdmKreditImg, ttdYangMenyerahkanImg, ttdYangMenerimaImg, ttdMengetahuiImg,
  } = body;

  if (!nomorDokumen || !namaNasabah) {
    return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 });
  }

  try {
    const created = await prisma.beritaAcara.create({
      data: {
        agunanId: null,
        isManual: true,
        nomorDokumen,
        nomorRegister: '-',
        namaNasabah,
        alamat,
        alamatManual: alamat,
        nomorRekening,
        tanggalLunas: tanggalLunas ? new Date(tanggalLunas) : null,
        jenisAgunan: 'AGUNAN MANUAL (BELUM TERDAFTAR)',
        daftarAgunanManual: JSON.stringify(daftarAgunan || []),
        photoDataUrl,
        ttdAdmKredit: ttdAdmKredit || '',
        ttdYangMenyerahkan: ttdYangMenyerahkan || '',
        ttdYangMenerima: ttdYangMenerima || '',
        ttdMengetahui: ttdMengetahui || '',
        ttdAdmKreditImg: ttdAdmKreditImg || null,
        ttdYangMenyerahkanImg: ttdYangMenyerahkanImg || null,
        ttdYangMenerimaImg: ttdYangMenerimaImg || null,
        ttdMengetahuiImg: ttdMengetahuiImg || null,
      },
    });
    return NextResponse.json(created);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal menyimpan berita acara manual.' }, { status: 500 });
  }
}