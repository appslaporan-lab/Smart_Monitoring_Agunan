import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import UploadNominatifForm from './UploadNominatifForm';

export const dynamic = 'force-dynamic';

export default async function UploadNominatifPage() {
  const user = getCurrentUser();
  if (!user) redirect('/auth/login');
  if (user.role !== 'SUPERADMIN') redirect('/collecting');

  const periodes = await prisma.periodeNominatif.findMany({
    orderBy: [{ tahun: 'desc' }, { bulan: 'desc' }],
    take: 12,
  });

  return (
    <main className="container">
      <section style={{ marginBottom: 32 }}>
        <h1>Upload Data Nominatif</h1>
        <p>Upload file nominatif.xlsx setiap awal bulan. Hanya kategori debitur UK, UM, dan UT yang akan diimport.</p>
      </section>

      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <UploadNominatifForm />
      </div>

      <div className="card" style={{ padding: 24 }}>
        <h2>Riwayat Upload</h2>
        {periodes.length === 0 ? (
          <p>Belum ada data nominatif yang diupload.</p>
        ) : (
          <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
            {periodes.map((p) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span>Periode {p.bulan}/{p.tahun} — {p.namaFile}</span>
                <span className="status-pill status-pending">{p.totalBaris} baris</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}