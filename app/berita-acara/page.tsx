import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import BeritaAcaraList from './BeritaAcaraList';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Penyerahan Agunan (Berita Acara)',
};

type BeritaAcaraWithAgunan = Prisma.BeritaAcaraGetPayload<{ include: { agunan: true } }>;

async function getBeritaAcaras() {
  return prisma.beritaAcara.findMany({ include: { agunan: true }, orderBy: { createdAt: 'desc' } });
}

export default async function BeritaAcaraPage() {
  const beritaAcaras = await getBeritaAcaras();

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Penyerahan Agunan</h1>
          <p style={{ color: '#64748b', fontSize: '1.05rem', margin: 0 }}>Kelola Berita Acara serah terima agunan dan ekspor data secara terpusat.</p>
        </div>
        <Link href="/berita-acara/export" className="button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Ekspor Excel/PDF
        </Link>
      </div>
      <BeritaAcaraList beritaAcaras={beritaAcaras} />
    </div>
  );
}
