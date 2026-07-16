import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const {
    nomorDokumen,
    namaNasabah,
    alamat,
    nomorRekening,
    tanggalLunas,
    jenisAgunan,
    ttdAdmKredit,
    ttdYangMenyerahkan,
    ttdYangMenerima,
    ttdMengetahui,
  } = body;

  if (!nomorDokumen || !namaNasabah || !jenisAgunan || !ttdAdmKredit || !ttdYangMenyerahkan || !ttdYangMenerima || !ttdMengetahui) {
    return NextResponse.json({ error: 'Data berita acara tidak lengkap.' }, { status: 400 });
  }

  try {
    const updated = await prisma.beritaAcara.update({
      where: { id: Number(params.id) },
      data: {
        nomorDokumen,
        namaNasabah,
        alamat,
        nomorRekening,
        tanggalLunas: tanggalLunas ? new Date(tanggalLunas) : null,
        jenisAgunan,
        ttdAdmKredit,
        ttdYangMenyerahkan,
        ttdYangMenerima,
        ttdMengetahui,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal memperbarui berita acara.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.beritaAcara.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ message: 'Berita acara berhasil dihapus.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal menghapus berita acara.' }, { status: 500 });
  }
}
