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

    // Save error to database
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

    // Format currency for text logging
    const fmt = (v: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

    const kegiatanStr = `Melakukan Transaksi Harian Teller:
- Setoran Tabungan: ${result.setoran.count} Trx (${fmt(result.setoran.total)})
- Tarikan Tabungan: ${result.penarikan.count} Trx (${fmt(result.penarikan.total)})
- Angsuran/Pelunasan: ${result.angsuran.count} Trx (${fmt(result.angsuran.total)})
- Pencairan Pinjaman: ${result.pencairan.count} Trx (${fmt(result.pencairan.total)})`;

    const totalCount = result.setoran.count + result.penarikan.count + result.angsuran.count + result.pencairan.count;
    const totalNominal = result.setoran.total + result.penarikan.total + result.angsuran.total + result.pencairan.total;

    // Save activities to Performa Karyawan
    await prisma.performaKaryawan.upsert({
      where: {
        userId_tanggal: {
          userId: user.id,
          tanggal: tanggal,
        }
      },
      update: {
        kegiatan: kegiatanStr,
        jumlahKegiatan: totalCount,
        nominal: totalNominal,
        kesalahan: result.errorCount,
      },
      create: {
        userId: user.id,
        tanggal: tanggal,
        kegiatan: kegiatanStr,
        jumlahKegiatan: totalCount,
        nominal: totalNominal,
        kesalahan: result.errorCount,
      }
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Teller parser error:', error);
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan saat memproses file.' }, { status: 500 });
  }
}
