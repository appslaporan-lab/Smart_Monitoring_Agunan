import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { Info } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PerformaKaryawanPage() {
  const user = getCurrentUser();
  if (!user) redirect('/auth/login');

  // Fetch only the logged in user's records
  const records = await prisma.performaKaryawan.findMany({
    where: {
      userId: user.id
    },
    include: {
      user: {
        select: { nama: true, role: true }
      }
    },
    orderBy: {
      tanggal: 'desc'
    },
    take: 100 // Show latest 100 days
  });

  return (
    <main className="container">
      <div style={{ marginBottom: 24 }}>
        <h1>Rapor Performa Karyawan</h1>
        <p>Log kegiatan performa harian Anda berdasarkan kalkulasi sistem KPI otomatis.</p>
      </div>

      <section className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0 }}>Riwayat Kegiatan (Pribadi)</h2>
        </div>

        {records.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
            <Info size={40} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p>Belum ada log kegiatan performa untuk Anda. Data akan terisi otomatis saat Anda memproses laporan (misal: Transaksi Harian Teller).</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px 16px', whiteSpace: 'nowrap' }}>Tanggal</th>
                  <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px 16px', whiteSpace: 'nowrap' }}>Nama Karyawan</th>
                  <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px 16px', whiteSpace: 'nowrap' }}>Jabatan</th>
                  <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px 16px' }}>Kegiatan</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id}>
                    <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px 16px', whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                      {new Date(r.tanggal).toLocaleDateString('id-ID', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px 16px', fontWeight: 500, verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                      {r.user.nama}
                    </td>
                    <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px 16px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                      {r.user.role}
                    </td>
                    <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px 16px', verticalAlign: 'top' }}>
                      <pre style={{ 
                        margin: 0, 
                        fontFamily: 'inherit', 
                        whiteSpace: 'pre-wrap',
                        background: '#f8fafc',
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid #e2e8f0',
                        fontSize: 14,
                        lineHeight: 1.5
                      }}>
                        {r.kegiatan}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
