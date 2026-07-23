import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  if (!q || q.length < 2) return NextResponse.json({ results: [] });

  const nasabahs = await prisma.nasabah.findMany({
    where: {
      OR: [
        { nama: { contains: q, mode: 'insensitive' } },
        { registrasis: { some: { nomorRekening: { contains: q, mode: 'insensitive' } } } },
      ],
    },
    include: {
      agunans: { orderBy: { updatedAt: 'desc' } },
    },
    take: 10,
  });

  return NextResponse.json({ results: nasabahs });
}