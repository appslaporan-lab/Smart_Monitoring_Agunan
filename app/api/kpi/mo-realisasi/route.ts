import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { logActivity } from '@/lib/audit';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tanggal, nominal, keterangan, targetUserId, jenis, saldoAkhir, nominalAsli } = await req.json();

    if (!tanggal || nominal === undefined || nominal === null) {
      return NextResponse.json({ error: 'Tanggal dan nominal wajib diisi' }, { status: 400 });
    }

    let finalUserId = user.id;

    if (user.role === 'SUPERADMIN' && targetUserId) {
      finalUserId = parseInt(targetUserId, 10);
    }

    const newRecord = await prisma.realisasiHarianMO.create({
      data: {
        userId: finalUserId,
        tanggal: new Date(tanggal),
        nominal: parseFloat(nominal),
        jenis: jenis || 'BARU',
        saldoAkhir: saldoAkhir ? parseFloat(saldoAkhir) : 0,
        nominalAsli: nominalAsli ? parseFloat(nominalAsli) : parseFloat(nominal),
        keterangan: keterangan || '',
      }
    });

    return NextResponse.json({ success: true, data: newRecord });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = getCurrentUser();
    if (!user || user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, nominal, keterangan, jenis, saldoAkhir, nominalAsli } = await req.json();

    if (!id) return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 });

    const updatedRecord = await prisma.realisasiHarianMO.update({
      where: { id: parseInt(id, 10) },
      data: {
        nominal: nominal !== undefined ? parseFloat(nominal) : undefined,
        jenis: jenis !== undefined ? jenis : undefined,
        saldoAkhir: saldoAkhir !== undefined ? parseFloat(saldoAkhir) : undefined,
        nominalAsli: nominalAsli !== undefined ? parseFloat(nominalAsli) : undefined,
        keterangan: keterangan !== undefined ? keterangan : undefined,
      }
    });

    return NextResponse.json({ success: true, data: updatedRecord });
  } catch (error: any) {
    console.error('API PUT Error:', error);
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = getCurrentUser();
    if (!user || user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await req.json();

    if (!id) return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 });

    await prisma.realisasiHarianMO.delete({
      where: { id: parseInt(id, 10) }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API DELETE Error:', error);
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Existing GET logic (omitted as it's not strictly needed if we fetch via Server Components, but kept for completeness)
  return NextResponse.json({ success: false, error: 'Not Implemented' }, { status: 404 });
}
