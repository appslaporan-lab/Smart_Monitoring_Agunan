import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const agunans = await prisma.agunan.findMany({ include: { nasabah: true } });
    const summary = {
      total: agunans.length,
      pending: agunans.filter((item) => item.status === 'PENDING').length,
      dikeluarkan: agunans.filter((item) => item.status === 'DIKELUARKAN').length,
      diserahkan: agunans.filter((item) => item.status === 'DISERAHKAN').length,
      keluarBelumSerah: agunans.filter((item) => item.keluarDariBrankas && !item.diserahkanKeNasabah).length,
      her5Tahun: agunans.filter((item) => item.jenis === 'BPKB' && item.her5Reminder && new Date(item.her5Reminder) <= new Date()).length,
    };

    return NextResponse.json({ summary, agunans });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal mengambil laporan.' }, { status: 500 });
  }
}
