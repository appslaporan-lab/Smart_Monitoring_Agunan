import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const body = await request.json();
  const {
    agunanId, nomorDokumen, nomorRegister, namaNasabah, nomorRekening, tanggalLunas,
    cabangAsal, cabangTujuan,
    namaPihakPertama, jabatanPihakPertama, ttdPihakPertamaImg,
    namaPihakKedua, jabatanPihakKedua, ttdPihakKeduaImg,
    namaMengetahui, jabatanMengetahui, ttdMengetahuiImg,
  } = body;

  if (!agunanId || !nomorDokumen || !nomorRegister || !namaNasabah) {
    return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 });
  }

  try {
    const created = await prisma.beritaAcaraTransfer.create({
      data: {
        agunanId: Number(agunanId),
        nomorDokumen,
        nomorRegister,
        namaNasabah,
        nomorRekening,
        tanggalLunas: tanggalLunas ? new Date(tanggalLunas) : null,
        cabangAsal,
        cabangTujuan,
        namaPihakPertama, jabatanPihakPertama, ttdPihakPertamaImg,
        namaPihakKedua, jabatanPihakKedua, ttdPihakKeduaImg,
        namaMengetahui, jabatanMengetahui, ttdMengetahuiImg,
      },
    });
    return NextResponse.json(created);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal menyimpan berita acara transfer.' }, { status: 500 });
  }
}