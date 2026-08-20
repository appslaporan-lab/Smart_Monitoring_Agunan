import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = getCurrentUser();
    if (!user || user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const periodeId = parseInt(params.id, 10);
    if (isNaN(periodeId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const periode = await prisma.periodeNominatif.findUnique({
      where: { id: periodeId }
    });

    if (!periode) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 });
    }

    // Hapus child data (PinjamanPeriode) terlebih dahulu karena adanya foreign key
    await prisma.pinjamanPeriode.deleteMany({
      where: { periodeId: periodeId }
    });

    // Hapus parent data (PeriodeNominatif)
    await prisma.periodeNominatif.delete({
      where: { id: periodeId }
    });

    return NextResponse.json({ success: true, message: 'Data nominatif berhasil dihapus' });
  } catch (error: any) {
    console.error('Delete nominatif error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
