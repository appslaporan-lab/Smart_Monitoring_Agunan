import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { Trophy, AlertTriangle, Calendar, PlusCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import SuperadminManageRealisasi from '@/components/SuperadminManageRealisasi';

export const dynamic = 'force-dynamic';

const TARGET_MO = 350000000; // 350 Juta

export default async function MORankingPage({ searchParams }: { searchParams: { bulan?: string; tahun?: string } }) {
  const user = getCurrentUser();
  if (!user) redirect('/auth/login');

  const now = new Date();
  const bulan = searchParams.bulan ? parseInt(searchParams.bulan) : now.getMonth() + 1;
  const tahun = searchParams.tahun ? parseInt(searchParams.tahun) : now.getFullYear();

  const startDate = new Date(tahun, bulan - 1, 1);
  const endDate = new Date(tahun, bulan, 0, 23, 59, 59, 999);


  let whereMO: any = { tanggal: { gte: startDate, lte: endDate } };
  let whereTeller: any = { tanggal: { gte: startDate, lte: endDate }, kegiatan: 'Pencairan Pinjaman' };

  if (user.role === 'SUPERADMIN' || user.role === 'DIREKSI') {
    // see all
  } else if (user.role.includes('MARKETING') || user.role === 'AO') {
    whereMO.userId = user.id;
    whereTeller.user = { subKantor: user.subKantor || 'Pusat' };
  } else {
    // KEPALA KAS, KASUBAG KREDIT, dll see their branch
    whereMO.user = { subKantor: user.subKantor || 'Pusat' };
    whereTeller.user = { subKantor: user.subKantor || 'Pusat' };
  }

  // 1. Fetch MO Manual Inputs
  const moRecords = await prisma.realisasiHarianMO.findMany({
    where: whereMO,

    include: { user: { select: { nama: true, subKantor: true } } }
  });

  // 2. Fetch Teller "Pencairan Pinjaman"
  const tellerRecords = await prisma.performaKaryawan.findMany({
    where: whereTeller,
    include: { user: { select: { subKantor: true } } }
  });

  // Calculate MO Ranking
  const moStats: Record<number, { nama: string; total: number; count: number; subKantor: string }> = {};
  for (const r of moRecords) {
    if (!moStats[r.userId]) moStats[r.userId] = { nama: r.user.nama, subKantor: r.user.subKantor || 'Pusat', total: 0, count: 0 };
    moStats[r.userId].total += r.nominal;
    moStats[r.userId].count += 1;
  }

  const rankingArray = Object.values(moStats).sort((a, b) => b.total - a.total);

  // Calculate Reconciliation per Sub Kantor
  const rekonStats: Record<string, { moTotal: number; tellerTotal: number }> = {};
  
  // Aggregate MO per Sub Kantor
  for (const r of moRecords) {
    const sk = r.user.subKantor || 'Pusat';
    if (!rekonStats[sk]) rekonStats[sk] = { moTotal: 0, tellerTotal: 0 };
    rekonStats[sk].moTotal += r.nominal;
  }

  // Aggregate Teller per Sub Kantor
  for (const r of tellerRecords) {
    const sk = r.user.subKantor || 'Pusat';
    if (!rekonStats[sk]) rekonStats[sk] = { moTotal: 0, tellerTotal: 0 };
    rekonStats[sk].tellerTotal += r.nominal;
  }

  const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  return (
    <main className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1>KPI MO: Realisasi & Ranking</h1>
          <p>Ranking performa bulanan MO dan rekonsiliasi pencairan dengan laporan Teller.</p>
        </div>
        <Link href="/kpi/mo-realisasi/input" className="button" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <PlusCircle size={18} />
          Input Realisasi Harian
        </Link>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center', background: '#f8fafc' }}>
        <Calendar size={20} color="#64748b" />
        <form method="GET" style={{ display: 'flex', gap: 12, alignItems: 'center', margin: 0 }}>
          <select name="bulan" className="inputField" defaultValue={bulan} style={{ width: 'auto', padding: '8px 12px' }}>
            {Array.from({length: 12}).map((_, i) => (
              <option key={i+1} value={i+1}>Bulan {i+1}</option>
            ))}
          </select>
          <select name="tahun" className="inputField" defaultValue={tahun} style={{ width: 'auto', padding: '8px 12px' }}>
            {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button type="submit" className="button secondary">Tampilkan Data</button>
        </form>
      </div>

      <section className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <Trophy size={24} color="#eab308" />
          <h2 style={{ margin: 0 }}>Ranking MO (Bulan {bulan}/{tahun})</h2>
        </div>

        {rankingArray.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: 20 }}>Belum ada input realisasi MO bulan ini.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px' }}>Rank</th>
                  <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px' }}>Nama MO</th>
                  <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px' }}>Kantor</th>
                  <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px', textAlign: 'center' }}>Jml Nasabah</th>
                  <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px' }}>Nominal Realisasi</th>
                  <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px' }}>Target MO</th>
                  <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px' }}>+/- dari Target</th>
                  <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px' }}>Status Peringkat</th>
                </tr>
              </thead>
              <tbody>
                {rankingArray.map((mo, idx) => {
                  const selisih = mo.total - TARGET_MO;
                  const isHit = selisih >= 0;
                  
                  let rankBadge = null;
                  if (idx === 0) rankBadge = <span style={{ background: '#fef08a', color: '#854d0e', padding: '4px 8px', borderRadius: 4, fontWeight: 'bold' }}>👑 #1</span>;
                  else if (idx === 1) rankBadge = <span style={{ background: '#e2e8f0', color: '#475569', padding: '4px 8px', borderRadius: 4, fontWeight: 'bold' }}>🥈 #2</span>;
                  else if (idx === 2) rankBadge = <span style={{ background: '#ffedd5', color: '#9a3412', padding: '4px 8px', borderRadius: 4, fontWeight: 'bold' }}>🥉 #3</span>;
                  else rankBadge = <span style={{ color: '#64748b', fontWeight: 600 }}>#{idx + 1}</span>;

                  let predikat = "";
                  let predikatColor = "";
                  let predikatBg = "";
                  
                  if (idx === 0) { predikat = "Luar Biasa"; predikatColor = "#15803d"; predikatBg = "#dcfce7"; }
                  else if (isHit) { predikat = "Lulus Target"; predikatColor = "#16a34a"; predikatBg = "#f0fdf4"; }
                  else { predikat = "Belum Lulus"; predikatColor = "#dc2626"; predikatBg = "#fef2f2"; }

                  return (
                    <tr key={mo.nama}>
                      <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px' }}>{rankBadge}</td>
                      <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px', fontWeight: 600 }}>{mo.nama}</td>
                      <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px' }}>{mo.subKantor}</td>
                      <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>{mo.count}</td>
                      <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px', fontWeight: 'bold', color: '#0f172a' }}>{formatCurrency(mo.total)}</td>
                      <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px', color: '#64748b' }}>{formatCurrency(TARGET_MO)}</td>
                      <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px', fontWeight: 600, color: isHit ? '#16a34a' : '#dc2626' }}>
                        {isHit ? '+' : ''}{formatCurrency(selisih)}
                      </td>
                      <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px' }}>
                        <span style={{ background: predikatBg, color: predikatColor, padding: '6px 12px', borderRadius: 20, fontSize: 13, fontWeight: 'bold' }}>
                          {predikat}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <AlertTriangle size={24} color="#f97316" />
          <h2 style={{ margin: 0 }}>Rekonsiliasi per Kantor (Bulan {bulan}/{tahun})</h2>
        </div>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: -12, marginBottom: 20 }}>
          Membandingkan total Input Manual MO dengan total Laporan Pencairan dari Teller per masing-masing Sub Kantor.
        </p>

        {Object.keys(rekonStats).length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: 20 }}>Belum ada data rekonsiliasi.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px' }}>Kantor Kas</th>
                  <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px' }}>Total Input MO</th>
                  <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px' }}>Total Laporan Teller</th>
                  <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px' }}>Selisih (MO - Teller)</th>
                  <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px' }}>Status Rekonsiliasi</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(rekonStats).map(([sk, data]) => {
                  const selisih = data.moTotal - data.tellerTotal;
                  const isMatch = selisih === 0;

                  return (
                    <tr key={sk}>
                      <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px', fontWeight: 600 }}>{sk}</td>
                      <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px', color: '#2563eb', fontWeight: 600 }}>{formatCurrency(data.moTotal)}</td>
                      <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px', color: '#9333ea', fontWeight: 600 }}>{formatCurrency(data.tellerTotal)}</td>
                      <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px', fontWeight: 'bold', color: isMatch ? '#16a34a' : '#dc2626' }}>
                        {formatCurrency(selisih)}
                      </td>
                      <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px' }}>
                        {isMatch ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#16a34a', fontWeight: 600 }}>
                            <CheckCircle size={16} /> Cocok (Sesuai)
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#dc2626', fontWeight: 600 }}>
                            <AlertTriangle size={16} /> Ada Selisih
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {user.role === 'SUPERADMIN' && <SuperadminManageRealisasi records={moRecords as any} />}
    </main>
  );
}
