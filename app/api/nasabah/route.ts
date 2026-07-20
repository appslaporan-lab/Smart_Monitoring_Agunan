import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { nama, nik, alamat, telepon, statusPernikahan, namaPasangan, nomorRekening } = data;

    if (!nama || !nik) {
      return NextResponse.json({ error: 'Nama dan NIK wajib diisi' }, { status: 400 });
    }

    const year = new Date().getFullYear().toString();
    const prefix = `REG-${year}-`;
    const lastReg = await prisma.registrasi.findFirst({
      where: { kodeRegister: { startsWith: prefix } },
      orderBy: { kodeRegister: 'desc' },
    });
    let sequence = 1;
    if (lastReg) {
      const lastSeq = parseInt(lastReg.kodeRegister.replace(prefix, ''), 10);
      if (!isNaN(lastSeq)) sequence = lastSeq + 1;
    }
    const kodeRegister = `${prefix}${sequence.toString().padStart(4, '0')}`;

    const newNasabah = await prisma.nasabah.create({
      data: {
        nama,
        nik,
        alamat,
        telepon,
        statusPernikahan: statusPernikahan || 'BELUM_NIKAH',
        namaPasangan: statusPernikahan === 'MENIKAH' ? namaPasangan : null,
        registrasis: {
          create: { kodeRegister, nomorRekening, status: 'AKTIF' },
        },
      },
      include: { registrasis: true },
    });

    return NextResponse.json({ success: true, nasabah: newNasabah, kodeRegister });
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('nik')) {
      return NextResponse.json({ error: 'NIK sudah terdaftar di sistem.' }, { status: 400 });
    }
    console.error('Error creating nasabah:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}