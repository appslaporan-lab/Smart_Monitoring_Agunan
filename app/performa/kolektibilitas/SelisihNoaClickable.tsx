'use client';

import React, { useState } from 'react';

type NasabahDetail = {
  norek: string;
  nama: string;
  kolLalu: string | null;
  kolKini: string | null;
  osLalu: number;
  osKini: number;
};

type Props = {
  kolektibilitas: string;
  diffNOA: number;
  inflows: NasabahDetail[];
  outflows: NasabahDetail[];
};

export default function SelisihNoaClickable({ kolektibilitas, diffNOA, inflows, outflows }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const isTotal = kolektibilitas === 'total';
  const label = isTotal ? 'Grand Total' : `KOL ${kolektibilitas}`;

  return (
    <>
      <span 
        style={{ 
          cursor: 'pointer', 
          textDecoration: 'underline', 
          color: diffNOA > 0 ? '#dc2626' : diffNOA < 0 ? '#16a34a' : 'inherit'
        }}
        onClick={() => setIsOpen(true)}
        title="Klik untuk melihat detail pergerakan nasabah"
      >
        {diffNOA > 0 ? '+' : ''}{diffNOA}
      </span>

      {isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, 
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'white', padding: 24, borderRadius: 8, 
            width: '90%', maxWidth: 800, maxHeight: '90vh', overflowY: 'auto',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Detail Pergerakan NOA - {label} (Selisih: {diffNOA > 0 ? '+' : ''}{diffNOA})</h3>
              <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: 24, cursor: 'pointer' }}>&times;</button>
            </div>
            
            <p style={{ color: '#64748b', marginBottom: 16 }}>
              Menampilkan daftar nasabah yang masuk (Inflow) dan keluar (Outflow) dari {label} di bulan ini.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <h4 style={{ margin: '0 0 12px 0', color: '#dc2626' }}>Masuk ke {label} (+{inflows.length})</h4>
                {inflows.length === 0 ? <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Tidak ada data masuk.</p> : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                        <th style={{ padding: '6px', border: '1px solid #e2e8f0' }}>Nasabah</th>
                        <th style={{ padding: '6px', border: '1px solid #e2e8f0' }}>KOL Lalu &rarr; Kini</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inflows.map((n, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: '6px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontWeight: 600 }}>{n.nama}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{n.norek}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>OS: {formatRupiah(n.osKini)}</div>
                          </td>
                          <td style={{ padding: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                            <span style={{ color: '#94a3b8' }}>{n.kolLalu || 'Baru'}</span> 
                            &rarr; 
                            <span style={{ fontWeight: 'bold' }}>{n.kolKini}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div>
                <h4 style={{ margin: '0 0 12px 0', color: '#16a34a' }}>Keluar dari {label} (-{outflows.length})</h4>
                {outflows.length === 0 ? <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Tidak ada data keluar.</p> : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                        <th style={{ padding: '6px', border: '1px solid #e2e8f0' }}>Nasabah</th>
                        <th style={{ padding: '6px', border: '1px solid #e2e8f0' }}>KOL Lalu &rarr; Kini</th>
                      </tr>
                    </thead>
                    <tbody>
                      {outflows.map((n, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: '6px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontWeight: 600 }}>{n.nama}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{n.norek}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>OS: {formatRupiah(n.osLalu)}</div>
                          </td>
                          <td style={{ padding: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                            <span style={{ fontWeight: 'bold' }}>{n.kolLalu}</span> 
                            &rarr; 
                            <span style={{ color: '#94a3b8' }}>{n.kolKini || 'Lunas/Hilang'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
