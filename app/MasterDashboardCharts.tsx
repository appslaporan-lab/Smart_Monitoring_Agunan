'use client';

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import AgunanStatusChart from './AgunanStatusChart';

export default function MasterDashboardCharts({
  agunanProps,
  kolekStats,
  collectingStats,
  kpiStats
}: any) {
  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#f97316', '#ef4444'];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px', marginTop: '24px' }}>
      {/* Kolektibilitas */}
      <div className="card" style={{ padding: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Kolektibilitas (Outstanding)</h2>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={kolekStats.byBranch} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="branch" />
              <YAxis tickFormatter={(v) => (v / 1000000).toFixed(0) + 'M'} />
              <RechartsTooltip formatter={(v: any) => 'Rp ' + v.toLocaleString('id-ID')} />
              <Legend />
              <Bar dataKey="nonNpl" name="Non NPL" stackId="a" fill="#22c55e" />
              <Bar dataKey="npl" name="NPL" stackId="a" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Collecting */}
      <div className="card" style={{ padding: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Kunjungan Penagihan (7 Hari Terakhir)</h2>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={collectingStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="BERHASIL" stackId="a" fill="#22c55e" />
              <Bar dataKey="JANJI_BAYAR" stackId="a" fill="#f59e0b" />
              <Bar dataKey="GAGAL" stackId="a" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* KPI Placeholder */}
      <div className="card" style={{ padding: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Indikator Kinerja Utama (KPI)</h2>
        <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <PieChart width={300} height={250}>
            <Pie
              data={kpiStats}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {kpiStats.map((entry: any, index: number) => (
                <Cell key={'cell-' + index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip />
            <Legend />
          </PieChart>
          <div style={{ textAlign: 'center', color: '#64748b', fontSize: '12px', marginTop: '-10px' }}>
            *Data simulasi. Modul KPI sedang dalam pengembangan.
          </div>
        </div>
      </div>

      {/* Agunan */}
      <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Monitoring Agunan</h2>
        <div style={{ flex: 1, marginTop: '-24px' }}>
          <AgunanStatusChart {...agunanProps} />
        </div>
      </div>
    </div>
  );
}
