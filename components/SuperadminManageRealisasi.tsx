'use client';

import React, { useState } from 'react';
import { Edit2, Trash2, Save, X, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

type RealisasiRecord = {
  id: number;
  tanggal: Date;
  nominal: number;
  jenis: string;
  saldoAkhir: number;
  nominalAsli: number;
  keterangan: string | null;
  user: {
    nama: string;
  };
};

export default function SuperadminManageRealisasi({ records }: { records: RealisasiRecord[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [editJenis, setEditJenis] = useState('BARU');
  const [editNominalAsli, setEditNominalAsli] = useState('');
  const [editSaldoAkhir, setEditSaldoAkhir] = useState('');
  const [editKeterangan, setEditKeterangan] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);

  const startEdit = (rec: RealisasiRecord) => {
    setEditingId(rec.id);
    setEditJenis(rec.jenis);
    setEditNominalAsli(rec.nominalAsli.toString());
    setEditSaldoAkhir(rec.saldoAkhir.toString());
    setEditKeterangan(rec.keterangan || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  const saveEdit = async (id: number) => {
    const na = Number(editNominalAsli) || 0;
    const sa = editJenis === 'TOP_UP' ? (Number(editSaldoAkhir) || 0) : 0;
    const net = editJenis === 'TOP_UP' ? na - sa : na;

    setIsProcessing(true);
    try {
      const res = await fetch('/api/kpi/mo-realisasi', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          jenis: editJenis,
          nominalAsli: na,
          saldoAkhir: sa,
          nominal: net,
          keterangan: editKeterangan
        })
      });
      if (res.ok) {
        setEditingId(null);
        router.refresh();
      } else {
        alert('Gagal menyimpan data');
      }
    } catch (e) {
      alert('Error saving data');
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteRecord = async (id: number) => {
    if (!confirm('Yakin ingin menghapus data realisasi ini? Aksi ini tidak dapat dibatalkan.')) return;
    
    setIsProcessing(true);
    try {
      const res = await fetch('/api/kpi/mo-realisasi', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert('Gagal menghapus data');
      }
    } catch (e) {
      alert('Error deleting data');
    } finally {
      setIsProcessing(false);
    }
  };

  if (records.length === 0) return null;

  return (
    <section className="card" style={{ padding: 24, marginTop: 32, border: '2px solid #f87171' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <AlertTriangle size={24} color="#ef4444" />
        <h2 style={{ margin: 0, color: '#ef4444' }}>Akses Khusus Superadmin: Edit & Hapus Transaksi</h2>
      </div>
      <p style={{ color: '#64748b', marginBottom: 20, fontSize: 14 }}>
        Gunakan tabel di bawah ini untuk mengoreksi atau membatalkan input MO yang salah. Perubahan akan langsung merevisi Ranking dan Rekonsiliasi.
      </p>

      <div style={{ overflowX: 'auto' }}>
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px' }}>Tanggal</th>
              <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px' }}>Nama MO</th>
              <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px' }}>Jenis</th>
              <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px' }}>Plafon Baru</th>
              <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px' }}>Saldo Lama</th>
              <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px' }}>Net KPI</th>
              <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {records.map(rec => {
              const isEditing = editingId === rec.id;
              return (
                <tr key={rec.id}>
                  <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px' }}>
                    {new Date(rec.tanggal).toLocaleDateString('id-ID')}
                  </td>
                  <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px', fontWeight: 600 }}>
                    {rec.user.nama}
                  </td>
                  
                  {isEditing ? (
                    <>
                      <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px' }}>
                        <select value={editJenis} onChange={(e) => setEditJenis(e.target.value)} style={{ padding: 4, width: '100%' }}>
                          <option value="BARU">BARU</option>
                          <option value="TOP_UP">TOP UP</option>
                        </select>
                      </td>
                      <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px' }}>
                        <input type="number" value={editNominalAsli} onChange={(e) => setEditNominalAsli(e.target.value)} style={{ padding: 4, width: '100px' }} />
                      </td>
                      <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px' }}>
                        {editJenis === 'TOP_UP' ? (
                          <input type="number" value={editSaldoAkhir} onChange={(e) => setEditSaldoAkhir(e.target.value)} style={{ padding: 4, width: '100px' }} />
                        ) : '-'}
                      </td>
                      <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px', color: '#64748b' }}>
                        Hitung Otomatis
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px' }}>
                        <span style={{ background: rec.jenis === 'TOP_UP' ? '#fef3c7' : '#e0e7ff', padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 'bold', color: rec.jenis === 'TOP_UP' ? '#b45309' : '#4338ca' }}>
                          {rec.jenis}
                        </span>
                      </td>
                      <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px' }}>{formatCurrency(rec.nominalAsli)}</td>
                      <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px', color: '#64748b' }}>{rec.jenis === 'TOP_UP' ? formatCurrency(rec.saldoAkhir) : '-'}</td>
                      <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px', fontWeight: 'bold', color: '#16a34a' }}>{formatCurrency(rec.nominal)}</td>
                    </>
                  )}

                  <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px' }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => saveEdit(rec.id)} disabled={isProcessing} style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '6px', borderRadius: 4, cursor: 'pointer' }}>
                          <Save size={16} />
                        </button>
                        <button onClick={cancelEdit} disabled={isProcessing} style={{ background: '#94a3b8', color: '#fff', border: 'none', padding: '6px', borderRadius: 4, cursor: 'pointer' }}>
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => startEdit(rec)} disabled={isProcessing} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '6px', borderRadius: 4, cursor: 'pointer' }}>
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => deleteRecord(rec.id)} disabled={isProcessing} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px', borderRadius: 4, cursor: 'pointer' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
