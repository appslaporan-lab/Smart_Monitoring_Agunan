import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import BeritaAcaraList from './BeritaAcaraList';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Daftar Berita Acara',
};

type BeritaAcaraWithAgunan = Prisma.BeritaAcaraGetPayload<{ include: { agunan: true } }>;

async function getBeritaAcaras() {
  return prisma.beritaAcara.findMany({ include: { agunan: true }, orderBy: { createdAt: 'desc' } });
}

export default async function BeritaAcaraPage() {
  const beritaAcaras = await getBeritaAcaras();

  return (
    <main className="container" style={{ paddingTop: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1>Daftar Berita Acara</h1>
          <p>Kelola berita acara serah terima agunan dan ekspor data secara terpusat.</p>
        </div>
        <Link href="/berita-acara/export" className="button">Ekspor Excel/PDF</Link>
      </div>
      <BeritaAcaraList beritaAcaras={beritaAcaras} />
    </main>
  );
}
