import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const agunans = await prisma.agunan.findMany({ include: { nasabah: true, registrasi: true } });
    const summary = {
      total: agunans.length,
      diBrankas: agunans.filter((item) => item.status === 'DI_BRANKAS').length,
      prosesKeluar: agunans.filter((item) => item.status === 'PROSES_KELUAR').length,
      diserahkan: agunans.filter((item) => item.status === 'DISERAHKAN').length,
      her5Tahunan: agunans.filter((item) => item.status === 'HER_5_TAHUNAN').length,
      prosesSertifikasi: agunans.filter((item) => item.status === 'PROSES_SERTIFIKASI').length,
      her5TahunReminder: agunans.filter(
        (item) => item.jenis === 'BPKB' && item.her5Reminder && new Date(item.her5Reminder) <= new Date(),
      ).length,
    };
    return NextResponse.json({ summary, agunans });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal mengambil laporan.' }, { status: 500 });
  }
}