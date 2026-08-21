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
    const targetUserIdStr = formData.get('targetUserId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }
    if (!tanggalStr) {
      return NextResponse.json({ error: 'Tanggal Laporan wajib diisi' }, { status: 400 });
    }

    // Determine whose KPI this belongs to
    let targetId = user.id;
    let targetNama = user.nama;

    if (user.role === 'SUPERADMIN' && targetUserIdStr) {
      const parsedId = parseInt(targetUserIdStr, 10);
      if (!isNaN(parsedId)) {
        const targetUser = await prisma.user.findUnique({ where: { id: parsedId } });
        if (targetUser) {
          targetId = targetUser.id;
          targetNama = targetUser.nama;
        }
      }
    }

    const tanggal = new Date(tanggalStr);
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Process the excel file (filter by target user's name)
    const result = parseTellerExcel(buffer, targetNama);

    // Save error to RekapKesalahanTeller
    await prisma.rekapKesalahanTeller.upsert({
      where: {
        userId_tanggal: {
          userId: targetId,
          tanggal: tanggal,
        }
      },
      update: {
        jumlah: result.errorCount,
      },
      create: {
        userId: targetId,
        tanggal: tanggal,
        jumlah: result.errorCount,
      }
    });

    const activities = [
      { nama: 'Setoran Tabungan', data: result.setoran },
      { nama: 'Tarikan Tabungan', data: result.penarikan },
      { nama: 'Angsuran/Pelunasan', data: result.angsuran },
      { nama: 'Pencairan Pinjaman', data: result.pencairanPinjaman },
      { nama: 'Pencairan Deposito', data: result.pencairanDeposito },
    ];

    for (const act of activities) {
      if (act.data.count > 0 || act.data.errors > 0) {
        await prisma.performaKaryawan.upsert({
          where: {
            userId_tanggal_kegiatan: {
              userId: targetId,
              tanggal: tanggal,
              kegiatan: act.nama,
            }
          },
          update: {
            jumlahKegiatan: act.data.count,
            nominal: act.data.total,
            kesalahan: act.data.errors,
          },
          create: {
            userId: targetId,
            tanggal: tanggal,
            kegiatan: act.nama,
            jumlahKegiatan: act.data.count,
            nominal: act.data.total,
            kesalahan: act.data.errors,
          }
        });
      }
    }

    return NextResponse.json({ success: true, data: result, targetNama });
  } catch (error: any) {
    console.error('Teller parser error:', error);
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan saat memproses file.' }, { status: 500 });
  }
}
