import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const generateKodeRegister = async () => {
  const year = new Date().getFullYear();
  const prefix = `REG-${year}-`;
  const count = await prisma.registrasi.count({
    where: { kodeRegister: { startsWith: prefix } },
  });
  const nextNumber = String(count + 1).padStart(4, '0');
  return `${prefix}${nextNumber}`;
};

const getOrCreateRegistrasi = async (nasabahId: number, nomorRekening?: string) => {
  const latest = await prisma.registrasi.findFirst({
    where: { nasabahId },
    orderBy: { createdAt: 'desc' },
    include: { agunans: true },
  });

  const isSelesai = (reg: typeof latest) => {
    if (!reg) return true;
    if (reg.status === 'LUNAS') return true;
    if (reg.agunans.length === 0) return false;
    return reg.agunans.every((a) => a.diserahkanKeNasabah);
  };

  if (latest && !isSelesai(latest)) {
    if (nomorRekening) {
      await prisma.registrasi.update({ where: { id: latest.id }, data: { nomorRekening } });
    }
    return latest;
  }

  if (latest && isSelesai(latest) && latest.status !== 'LUNAS') {
    await prisma.registrasi.update({ where: { id: latest.id }, data: { status: 'LUNAS' } });
  }

  const kodeRegister = await generateKodeRegister();
  return prisma.registrasi.create({
    data: { kodeRegister, nasabahId, status: 'AKTIF', nomorRekening },
  });
};

export async function POST(request: Request) {
  const body = await request.json();
  const {
    jenis,
    deskripsi,
    tujuan,
    warningPesan,
    her5Reminder,
    nomorPolisi,
    namaPemilik,
    noRangka,
    noMesin,
    jenisKendaraan,
    tahunPembuatan,
    nomorBPKB,
    nomorSHM,
    namaPemilikSHM,
    beratEmas,
    karatEmas,
    taksiranHarga,
    nasabahId,
    newNasabah,
    nomorRekening,
  } = body;

  if (!jenis || (!nasabahId && !newNasabah)) {
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

    const registrasi = await getOrCreateRegistrasi(connectedNasabahId, nomorRekening);

    const newAgunan = await prisma.agunan.create({
      data: {
        kodeRegister: registrasi.kodeRegister,
        registrasi: { connect: { id: registrasi.id } },
        jenis,
        deskripsi: deskripsi || '',
        status: 'PENDING',
        tujuan,
        warningPesan,
        her5Reminder: her5Reminder ? new Date(her5Reminder) : null,
        nomorPolisi,
        namaPemilik,
        noRangka,
        noMesin,
        jenisKendaraan,
        tahunPembuatan,
        nomorBPKB,
        nomorSHM,
        namaPemilikSHM,
        beratEmas: beratEmas ? Number(beratEmas) : null,
        karatEmas,
        taksiranHarga: taksiranHarga ? Number(taksiranHarga) : null,
        nasabah: { connect: { id: connectedNasabahId } },
      },
    });

    return NextResponse.json({ ...newAgunan, kodeRegister: registrasi.kodeRegister });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan.' }, { status: 500 });
  }
}