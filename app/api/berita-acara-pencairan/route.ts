import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const body = await request.json();
  const {
    agunanId, nomorDokumen, nomorRegister, namaNasabah, nomorRekening,
    tanggalPencairan, keteranganPencairan,
    namaPihakPertama, jabatanPihakPertama, ttdPihakPertamaImg,
    namaPihakKedua, jabatanPihakKedua, ttdPihakKeduaImg,
    namaMengetahui, jabatanMengetahui, ttdMengetahuiImg,
  } = body;

  if (!agunanId || !nomorDokumen || !nomorRegister || !namaNasabah) {
    return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 });
  }

  try {
    const created = await prisma.beritaAcaraPencairan.create({
      data: {
        agunanId: Number(agunanId),
        nomorDokumen,
        nomorRegister,
        namaNasabah,
        nomorRekening,
        tanggalPencairan: tanggalPencairan ? new Date(tanggalPencairan) : null,
        keteranganPencairan,
        namaPihakPertama, jabatanPihakPertama, ttdPihakPertamaImg,
        namaPihakKedua, jabatanPihakKedua, ttdPihakKeduaImg,
        namaMengetahui, jabatanMengetahui, ttdMengetahuiImg,
      },
    });
    return NextResponse.json(created);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal menyimpan berita acara pencairan.' }, { status: 500 });
  }
}