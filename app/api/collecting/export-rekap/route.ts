import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import * as XLSX from 'xlsx';

export async function GET(request: Request) {
  const user = getCurrentUser();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  const { searchParams } = new URL(request.url);
  const periodeId = searchParams.get('periodeId');

  if (!periodeId) {
    return new NextResponse('Periode ID is required', { status: 400 });
  }

  try {
    const pId = parseInt(periodeId, 10);

    const kunjunganData = await prisma.kunjunganPenagihan.findMany({
      where: {
        pinjamanPeriode: {
          periodeId: pId
        }
      },
      include: {
        pinjamanPeriode: {
          select: {
            norek: true,
            namaNasabahExcel: true,
            subKantor: true,
            namaAO: true,
            hariTunggakan: true,
            kdKolektibilitas: true
          }
        }
      },
      orderBy: [
        { pinjamanPeriode: { subKantor: 'asc' } },
        { tanggalKunjungan: 'desc' }
      ]
    });

    const users = await prisma.user.findMany({ select: { id: true, nama: true } });
    const userMap = new Map(users.map(u => [u.id, u.nama]));

    // Format Data for Excel
    const dataForExcel = kunjunganData.map((k, index) => {
      const pinjaman = k.pinjamanPeriode;
      
      return {
        'No': index + 1,
        'Kantor / Sub': pinjaman.subKantor || 'Pusat',
        'Nomor Rekening': pinjaman.norek,
        'Nama Nasabah': pinjaman.namaNasabahExcel,
        'AO': pinjaman.namaAO,
        'Tunggakan (Hari)': pinjaman.hariTunggakan,
        'Kolektibilitas': pinjaman.kdKolektibilitas,
        'Petugas Kunjungan': userMap.get(k.petugasId) || `ID Petugas: ${k.petugasId}`,
        'Tanggal Kunjungan': new Date(k.tanggalKunjungan).toLocaleDateString('id-ID'),
        'Hasil Kunjungan': k.hasil.replace(/_/g, ' '),
        'Catatan': k.catatan || '-',
        'Nominal Bayar': k.nominalDibayar ? k.nominalDibayar : 0,
        'Tanggal Janji Bayar': k.tanggalJanjiBayar ? new Date(k.tanggalJanjiBayar).toLocaleDateString('id-ID') : '-'
      };
    });

    const ws = XLSX.utils.json_to_sheet(dataForExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap Kunjungan");

    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Rekap_Kunjungan_Kredit.xlsx"`
      }
    });

  } catch (error) {
    console.error('Export Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
