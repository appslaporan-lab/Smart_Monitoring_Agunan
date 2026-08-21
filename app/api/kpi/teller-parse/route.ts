import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { parseTellerExcel } from '@/lib/kpiTellerParser';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const tanggalStr = formData.get('tanggal') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }
    if (!tanggalStr) {
      return NextResponse.json({ error: 'Tanggal Laporan wajib diisi' }, { status: 400 });
    }

    const tanggal = new Date(tanggalStr);
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Process the excel file
    const result = parseTellerExcel(buffer, user.nama);

    // Save error to database (upsert to prevent duplicates for the same day)
    await prisma.rekapKesalahanTeller.upsert({
      where: {
        userId_tanggal: {
          userId: user.id,
          tanggal: tanggal,
        }
      },
      update: {
        jumlah: result.errorCount,
      },
      create: {
        userId: user.id,
        tanggal: tanggal,
        jumlah: result.errorCount,
      }
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Teller parser error:', error);
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan saat memproses file.' }, { status: 500 });
  }
}
