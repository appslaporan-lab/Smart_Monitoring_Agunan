import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Data Agunan',
};

type AgunanWithNasabah = Prisma.AgunanGetPayload<{ include: { nasabah: true } }>;

export default async function AgunanPage() {
  const agunans = await prisma.agunan.findMany({
    include: { nasabah: true },
    orderBy: { createdAt: 'desc' },
  }) as AgunanWithNasabah[];

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Data Agunan</h1>
          <p style={{ color: '#64748b', fontSize: '1.05rem', margin: 0 }}>Kelola dan monitor seluruh data agunan yang terdaftar di sistem.</p>
        </div>
        <Link href="/create" className="button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
          Tambah Agunan
        </Link>
      </div>

      <div className="card" style={{ padding: 24 }}>
        {agunans.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <svg style={{ margin: '0 auto 16px', opacity: 0.5 }} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 8v13H3V8"></path><path d="M1 3h22v5H1z"></path><path d="M10 12h4"></path></svg>
            <p style={{ fontSize: '1.1rem' }}>Belum ada data agunan.</p>
            <Link href="/create" className="button secondary" style={{ marginTop: '16px', display: 'inline-block' }}>Tambah Agunan Pertama</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {agunans.map((agunan) => (
              <div key={agunan.id} className="card" style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, border: '1px solid #f1f5f9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem', color: '#0f172a' }}>
                      <Link href={`/agunan/${agunan.id}`} style={{ color: '#2563eb' }}>{agunan.kodeRegister}</Link>
                    </h3>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>{agunan.jenis} • Nasabah: <strong>{agunan.nasabah.nama}</strong></p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span className={`status-pill status-${agunan.status.toLowerCase()}`}>
                    {agunan.status.replace(/_/g, ' ')}
                  </span>
                  <Link href={`/agunan/${agunan.id}`} className="button secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                    Detail
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
