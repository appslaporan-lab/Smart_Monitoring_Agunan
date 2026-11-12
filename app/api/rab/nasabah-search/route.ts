import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();

  if (q.length < 2) {
    return NextResponse.json({ items: [] });
  }

  try {
    const items = await prisma.pinjamanPeriode.findMany({
      where: {
        OR: [
          { norek: { contains: q, mode: 'insensitive' } },
          { namaNasabahExcel: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        norek: true,
        namaNasabahExcel: true,
        subKantor: true,
        namaAO: true,
        plafon: true,
        outstanding: true,
        norekTabungan: true,
        saldoTabungan: true,
      },
      take: 20,
      orderBy: { id: 'desc' },
    });

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error('Error search nasabah nominatif:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
