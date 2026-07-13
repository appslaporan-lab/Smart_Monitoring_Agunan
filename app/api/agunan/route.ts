import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const body = await request.json();
  const {
    kodeRegister,
    jenis,
    deskripsi,
    tujuan,
    keluarDariBrankas,
    keluarOleh,
    tanggalKeluar,
    diserahkanKeNasabah,
    diserahkanOleh,
    tanggalSerah,
    warningPesan,
    her5Reminder,
    nomorPolisi,
    namaPemilik,
    noRangka,
    noMesin,
    status,
    nasabahId,
    newNasabah,
  } = body;

  if (!kodeRegister || !jenis || !deskripsi || (!nasabahId && !newNasabah) || !status) {
    return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 });
  }

  try {
    let connectedNasabahId = nasabahId;

    if (!connectedNasabahId && newNasabah) {
      const createdNasabah = await prisma.nasabah.create({
        data: {
          nama: newNasabah.nama,
          nik: newNasabah.nik,
          alamat: newNasabah.alamat,
          telepon: newNasabah.telepon,
        },
      });
      connectedNasabahId = createdNasabah.id;
    }

    const newAgunan = await prisma.agunan.create({
      data: {
        kodeRegister,
        jenis,
        deskripsi,
        status,
        tujuan,
        keluarDariBrankas: Boolean(keluarDariBrankas),
        keluarOleh,
        tanggalKeluar: tanggalKeluar ? new Date(tanggalKeluar) : null,
        diserahkanKeNasabah: Boolean(diserahkanKeNasabah),
        diserahkanOleh,
        tanggalSerah: tanggalSerah ? new Date(tanggalSerah) : null,
        warningPesan,
        her5Reminder: her5Reminder ? new Date(her5Reminder) : null,
        nomorPolisi,
        namaPemilik,
        noRangka,
        noMesin,
        nasabah: { connect: { id: connectedNasabahId } },
      },
    });

    return NextResponse.json(newAgunan);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan.' }, { status: 500 });
  }
}
