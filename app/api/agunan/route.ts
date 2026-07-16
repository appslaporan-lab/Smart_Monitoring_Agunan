import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { registrasiId, agunans } = body;

    if (!registrasiId || !agunans || !Array.isArray(agunans) || agunans.length === 0) {
      return NextResponse.json({ error: 'Data tidak lengkap. Pilih Nomor Register dan minimal 1 Agunan.' }, { status: 400 });
    }

    const registrasi = await prisma.registrasi.findUnique({
      where: { id: parseInt(registrasiId) },
      include: { nasabah: true }
    });

    if (!registrasi) {
      return NextResponse.json({ error: 'Nomor Register tidak ditemukan.' }, { status: 404 });
    }

    const createdAgunans = await prisma.$transaction(
      agunans.map((agunan: any) => {
        return prisma.agunan.create({
          data: {
            kodeRegister: registrasi.kodeRegister,
            registrasi: { connect: { id: registrasi.id } },
            nasabah: { connect: { id: registrasi.nasabahId } },
            status: 'PENDING',
            jenis: agunan.jenis,
            deskripsi: agunan.deskripsi || '',
            nomorBPKB: agunan.nomorBPKB || null,
            jenisKendaraan: agunan.jenisKendaraan || null,
            nomorPolisi: agunan.nomorPolisi || null,
            noRangka: agunan.noRangka || null,
            noMesin: agunan.noMesin || null,
            namaPemilik: agunan.namaPemilik || null,
            alamatBPKB: agunan.alamatBPKB || null,
            nomorSHM: agunan.nomorSHM || null,
            namaPemilikSHM: agunan.namaPemilikSHM || null,
            lokasiSHM: agunan.lokasiSHM || null,
            luas: agunan.luas || null,
            nomorSK: agunan.nomorSK || null,
            namaSK: agunan.namaSK || null,
            jabatan: agunan.jabatan || null,
            nomorDeposito: agunan.nomorDeposito || null,
            namaDeposito: agunan.namaDeposito || null,
            nominalDeposito: agunan.nominalDeposito ? parseFloat(agunan.nominalDeposito) : null,
          }
        });
      })
    );

    return NextResponse.json({ 
      success: true, 
      count: createdAgunans.length,
      kodeRegister: registrasi.kodeRegister 
    });

  } catch (error: any) {
    console.error('Error creating agunan:', error);
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan.' }, { status: 500 });
  }
}