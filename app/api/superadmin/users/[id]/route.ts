import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(params.id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid User ID' }, { status: 400 });
    }

    // Prevent deleting oneself
    if (userId === currentUser.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    // Since we have foreign key relations (PerformaKaryawan, RealisasiHarianMO, dll),
    // deleting a user directly might cause constraint violations.
    // If the database has onDelete: Cascade, it's fine. If not, it will throw an error.
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    // Handle Prisma relation errors
    if (error.code === 'P2003') {
      return NextResponse.json({ error: 'Tidak dapat menghapus user karena ada data transaksi (KPI/Kolektibilitas) yang terhubung. Gunakan fitur nonaktifkan (jika ada).' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}
