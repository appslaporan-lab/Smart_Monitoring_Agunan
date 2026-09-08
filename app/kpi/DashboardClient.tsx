'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8b5cf6', '#ef4444', '#10b981'];

export default function DashboardClient({
  moChartData,
  tellerLineData,
  tellerKesalahanData,
  bulan,
  tahun,
}: {
  moChartData: any[];
  tellerLineData: any[];
  tellerKesalahanData: any[];
  bulan: number;
  tahun: number;
}) {
  const router = useRouter();

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    const currentBulan = name === 'bulan' ? value : bulan;
    const currentTahun = name === 'tahun' ? value : tahun;
    router.push(`/kpi?bulan=${currentBulan}&tahun=${currentTahun}`);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(1)} Jt`;
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  return (
    <main className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1>Dashboard KPI</h1>
          <p style={{ color: '#64748b' }}>Ringkasan Performa MO & Teller</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <select name="bulan" value={bulan} onChange={handleFilterChange} className="inputField" style={{ minWidth: 120 }}>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString('id-ID', { month: 'long' })}
              </option>
            ))}
          </select>
          <select name="tahun" value={tahun} onChange={handleFilterChange} className="inputField" style={{ minWidth: 100 }}>
            {[2023, 2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
        
        {/* MO CHART */}
        <section className="card" style={{ padding: 24 }}>
          <h2 style={{ marginBottom: 16, fontSize: '1.2rem' }}>Pencapaian Realisasi MO</h2>
          {moChartData.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '40px 0' }}>Tidak ada data MO di periode ini.</p>
          ) : (
            <div style={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nama" tick={{fontSize: 12}} />
                  <YAxis tickFormatter={formatCurrency} width={80} />
                  <RechartsTooltip formatter={(val: any) => `Rp ${Number(val).toLocaleString('id-ID')}`} />
                  <Legend />
                  <Bar dataKey="pencairan" name="Total Realisasi" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* TELLER LINE CHART */}
        <section className="card" style={{ padding: 24 }}>
          <h2 style={{ marginBottom: 16, fontSize: '1.2rem' }}>Aktivitas Harian Teller (Transaksi)</h2>
          {tellerLineData.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '40px 0' }}>Tidak ada data aktivitas Teller.</p>
          ) : (
            <div style={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tellerLineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tanggal" tick={{fontSize: 12}} />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  {Object.keys(tellerLineData[0] || {}).filter(k => k !== 'tanggal').map((key, index) => (
                    <Line key={key} type="monotone" dataKey={key} stroke={COLORS[index % COLORS.length]} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* TELLER KESALAHAN CHART */}
        <section className="card" style={{ padding: 24 }}>
          <h2 style={{ marginBottom: 16, fontSize: '1.2rem' }}>Komposisi Kesalahan Teller</h2>
          {tellerKesalahanData.length === 0 || tellerKesalahanData.every(d => d.value === 0) ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '40px 0' }}>Tidak ada data kesalahan Teller tercatat.</p>
          ) : (
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={tellerKesalahanData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {tellerKesalahanData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
