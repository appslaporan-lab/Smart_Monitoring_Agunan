import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { AlertTriangle, Info, Calendar } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function TellerKesalahanPage({ searchParams }: { searchParams: { bulan?: string; tahun?: string } }) {
  const user = getCurrentUser();
  if (!user) redirect('/auth/login');

  const now = new Date();
  const bulan = searchParams.bulan ? parseInt(searchParams.bulan) : now.getMonth() + 1;
  const tahun = searchParams.tahun ? parseInt(searchParams.tahun) : now.getFullYear();

  // Create date boundaries for the selected month
  const startDate = new Date(tahun, bulan - 1, 1);
  const endDate = new Date(tahun, bulan, 0, 23, 59, 59, 999);

  // Fetch all error records in this month
  // Fetch total harian from performa
  const performaData = await prisma.performaKaryawan.findMany({
    where: {
      tanggal: {
        gte: startDate,
        lte: endDate,
      }
    }
  });

  const performaTotals: Record<string, number> = {};
  for (const p of performaData) {
    const key = `${p.userId}-${new Date(p.tanggal).toISOString()}`;
    if (!performaTotals[key]) performaTotals[key] = 0;
    performaTotals[key] += p.jumlahKegiatan;
  }

  const records = await prisma.rekapKesalahanTeller.findMany({
    where: {
      tanggal: {
        gte: startDate,
        lte: endDate,
      }
    },
    include: {
      user: {
        select: { nama: true }
      }
    },
    orderBy: {
      tanggal: 'desc'
    }
  });

  // Group by Teller
  const errorByTeller: Record<number, { nama: string; totalKesalahan: number }> = {};
  for (const r of records) {
    if (!errorByTeller[r.userId]) {
      errorByTeller[r.userId] = { nama: r.user.nama, totalKesalahan: 0 };
    }
    errorByTeller[r.userId].totalKesalahan += r.jumlah;
  }

  // Find tellers with >= 3 errors
  const warnedTellers = Object.values(errorByTeller).filter(t => t.totalKesalahan >= 3);

  return (
    <main className="container">
      <div style={{ marginBottom: 24 }}>
        <h1>Monitoring Kesalahan Teller</h1>
        <p>Rekapitulasi otomatis kesalahan (nilai nominal minus) hasil pemrosesan Laporan Akhir Hari.</p>
      </div>

      {warnedTellers.length > 0 && (
        <div style={{ background: '#fef2f2', border: '1px solid #f87171', borderRadius: 8, padding: 16, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#dc2626', marginBottom: 12 }}>
            <AlertTriangle size={24} />
            <h3 style={{ margin: 0 }}>Peringatan Kinerja</h3>
          </div>
          <p style={{ margin: 0, color: '#991b1b', fontSize: 15 }}>
            Terdapat teller yang melakukan 3 kali atau lebih kesalahan transaksi pada bulan ini:
          </p>
          <ul style={{ marginTop: 8, marginBottom: 0, color: '#7f1d1d', fontWeight: 600 }}>
            {warnedTellers.map((t, idx) => (
              <li key={idx}>{t.nama} ({t.totalKesalahan}x Kesalahan)</li>
            ))}
          </ul>
        </div>
      )}

      <section className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0 }}>Riwayat Harian (Bulan {bulan}/{tahun})</h2>
          
          <form method="GET" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Calendar size={18} color="#64748b" />
            <select name="bulan" className="inputField" defaultValue={bulan} style={{ width: 'auto', padding: '6px 12px' }}>
              {Array.from({length: 12}).map((_, i) => (
                <option key={i+1} value={i+1}>Bulan {i+1}</option>
              ))}
            </select>
            <select name="tahun" className="inputField" defaultValue={tahun} style={{ width: 'auto', padding: '6px 12px' }}>
              {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <button type="submit" className="button">Filter</button>
          </form>
        </div>

        {records.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
            <Info size={40} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p>Belum ada data laporan / kesalahan pada bulan ini.</p>
          </div>
        ) : (
          <table className="table" style={{ width: '100%', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px 16px' }}>Tanggal Laporan</th>
                <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px 16px' }}>Nama Teller</th>
                <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px 16px' }}>Jumlah Transaksi Minus</th>
                <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px 16px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => {
                const key = `${r.userId}-${new Date(r.tanggal).toISOString()}`;
                const totalHarian = performaTotals[key] || 0;
                return (
                <tr key={r.id}>
                  <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px 16px' }}>
                    {new Date(r.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </td>
                  <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px 16px', fontWeight: 500 }}>{r.user.nama}</td>
                  <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{ fontWeight: 600, color: '#3b82f6', background: '#eff6ff', padding: '4px 8px', borderRadius: 12, fontSize: 13 }}>{totalHarian}</span>
                  </td>
                  <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px 16px' }}>
                    {r.jumlah > 0 ? (
                      <span style={{ color: '#e11d48', fontWeight: 600 }}>{r.jumlah} Kesalahan</span>
                    ) : (
                      <span style={{ color: '#16a34a' }}>Bersih (0 Kesalahan)</span>
                    )}
                  </td>
                  <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px 16px' }}>
                    {r.jumlah > 0 ? (
                      <span className="badge badge-danger" style={{ background: '#fee2e2', color: '#991b1b', padding: '4px 8px', borderRadius: 12, fontSize: 12 }}>Perlu Perhatian</span>
                    ) : (
                      <span className="badge badge-success" style={{ background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: 12, fontSize: 12 }}>Baik</span>
                    )}
                  </td>
                  </tr>
                )})}
              </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
