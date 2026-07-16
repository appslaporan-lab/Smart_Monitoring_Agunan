import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type NasabahWithAgunans = Prisma.NasabahGetPayload<{ include: { agunans: true } }>;

export default async function NasabahPage() {
  const nasabahs = await prisma.nasabah.findMany({
    include: { agunans: true },
    orderBy: { nama: 'asc' },
  }) as NasabahWithAgunans[];

  return (
    <main className="container">
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Data Nasabah</h1>
          <p style={{ color: '#64748b', fontSize: '1.05rem', margin: 0 }}>Daftar nasabah yang terdaftar beserta jumlah agunan yang dimiliki.</p>
        </div>
        <Link href="/nasabah/create" className="button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
          Tambah Nasabah
        </Link>
      </div>

      <div className="card" style={{ padding: 24 }}>
        {nasabahs.length === 0 ? (
          <p>Belum ada data nasabah.</p>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {nasabahs.map((nasabah) => (
              <article key={nasabah.id} className="card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <strong>{nasabah.nama}</strong>
                    <p>NIK: {nasabah.nik}</p>
                    <p>Telepon: {nasabah.telepon ?? '-'}</p>
                    <p>Alamat: {nasabah.alamat ?? '-'}</p>
                  </div>
                  <span className="status-pill status-pending">{nasabah.agunans.length} agunan</span>
                </div>
                {nasabah.agunans.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <h3>Agunan</h3>
                    <ul>
                      {nasabah.agunans.map((agunan: { id: number; kodeRegister: string; jenis: string }) => (
                        <li key={agunan.id}>
                          <Link href={`/agunan/${agunan.id}`}>{agunan.kodeRegister}</Link> — {agunan.jenis}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
