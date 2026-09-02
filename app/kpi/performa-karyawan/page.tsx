import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { Info, CheckCircle2, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PerformaKaryawanPage() {
  const user = getCurrentUser();
  if (!user) redirect('/auth/login');

  // Fetch only the logged in user's records
  const records = await prisma.performaKaryawan.findMany({
    where: (user.role === 'SUPERADMIN' || user.role === 'DIREKSI' || user.role === 'DIREKTUR') ? {} : { userId: user.id },
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

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };



  return (
    <main className="container">
      <div style={{ marginBottom: 24 }}>
        <h1>Rapor Performa Karyawan</h1>
        <p>Log kegiatan performa harian Anda berdasarkan kalkulasi sistem KPI otomatis.</p>
      </div>

      <section className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0 }}>Riwayat Kegiatan {(user.role === 'SUPERADMIN' || user.role === 'DIREKSI' || user.role === 'DIREKTUR') ? '(Semua Karyawan)' : '(Pribadi)'}</h2>
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
                  <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px 16px', textAlign: 'center' }}>Jml Kegiatan</th>
                  <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px 16px', textAlign: 'right' }}>Nominal</th>
                  <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px 16px', textAlign: 'center' }}>Kesalahan</th>
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
                      <span style={{ fontSize: 13, background: '#f8fafc', border: '1px solid #e2e8f0', padding: '4px 8px', borderRadius: 4 }}>
                        {r.user.role}
                      </span>
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
                        fontSize: 13,
                        lineHeight: 1.5,
                        color: '#334155'
                      }}>
                        {r.kegiatan}
                      </pre>
                    </td>
                    <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px 16px', verticalAlign: 'top', textAlign: 'center' }}>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{r.jumlahKegiatan}</span>
                    </td>
                    <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px 16px', verticalAlign: 'top', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <span style={{ fontWeight: 600, color: '#16a34a' }}>{formatCurrency(r.nominal)}</span>
                    </td>
                    <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px 16px', verticalAlign: 'top', textAlign: 'center' }}>
                      {r.kesalahan > 0 ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fee2e2', color: '#e11d48', padding: '4px 8px', borderRadius: 12, fontSize: 13, fontWeight: 600 }}>
                          <AlertCircle size={14} />
                          {r.kesalahan}
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#dcfce7', color: '#16a34a', padding: '4px 8px', borderRadius: 12, fontSize: 13, fontWeight: 600 }}>
                          <CheckCircle2 size={14} />
                          0
                        </span>
                      )}
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
