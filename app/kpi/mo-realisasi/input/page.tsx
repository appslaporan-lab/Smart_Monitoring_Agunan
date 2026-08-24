'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, ArrowLeft, Loader2, Save, Calculator } from 'lucide-react';
import Link from 'next/link';
import CurrencyInput from '@/components/CurrencyInput';
import toast from 'react-hot-toast';
// from '@/components/CurrencyInput';

export default function InputRealisasiMOPage() {
  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [jenis, setJenis] = useState<'BARU' | 'TOP_UP'>('BARU');
  const [nominalRealisasi, setNominalRealisasi] = useState<string>(''); // Plafon kotor
  const [saldoAkhir, setSaldoAkhir] = useState<string>(''); // Saldo pinjaman lama
  const [keterangan, setKeterangan] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [users, setUsers] = useState<any[]>([]);
  const [targetUserId, setTargetUserId] = useState<string>('');
  const [isSuperadmin, setIsSuperadmin] = useState(false);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          setIsSuperadmin(true);
          setUsers(json.data.filter((u: any) => u.role.includes('MARKETING') || u.role.includes('AO') || u.role === 'SUPERADMIN'));
        }
      })
      .catch(() => {});
  }, []);

  const getNominalNet = () => {
    const nr = Number(nominalRealisasi) || 0;
    if (jenis === 'BARU') return nr;
    const sa = Number(saldoAkhir) || 0;
    return nr - sa;
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const nr = Number(nominalRealisasi);
    if (!nr || isNaN(nr)) {
      toast.error('Nominal realisasi tidak valid');
      return;
    }

    const net = getNominalNet();
    if (net < 0) {
      toast.error('KPI tidak boleh minus (Saldo Akhir > Realisasi).');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/kpi/mo-realisasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tanggal,
          jenis,
          nominalAsli: nr,
          saldoAkhir: jenis === 'TOP_UP' ? (Number(saldoAkhir) || 0) : 0,
          nominal: net, // Pencapaian KPI bersih
          keterangan,
          targetUserId: targetUserId || undefined
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Terjadi kesalahan sistem');

      toast.success(`Berhasil! Pencapaian KPI tercatat: ${formatCurrency(net)}`);
      setNominalRealisasi('');
      setSaldoAkhir('');
      setKeterangan('');
      setJenis('BARU');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container" style={{ maxWidth: 650 }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/kpi/mo-realisasi" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#64748b', textDecoration: 'none', marginBottom: 16 }}>
          <ArrowLeft size={16} />
          Kembali ke Dashboard MO
        </Link>
        <h1>Input Realisasi Harian MO</h1>
        <p>Catat perolehan realisasi kredit harian Anda secara manual di sini.</p>
      </div>

      <section className="card" style={{ padding: 32 }}>
        {error && (
          <div className="alert alert-danger" style={{ marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="alert alert-success" style={{ marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center', background: '#dcfce7', color: '#166534', padding: 16, borderRadius: 8 }}>
            <CheckCircle size={20} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isSuperadmin && (
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="label">Nama MO (Akses Superadmin)</label>
              <select className="inputField" value={targetUserId} onChange={e => setTargetUserId(e.target.value)}>
                <option value="">-- Diri Sendiri --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.nama} ({u.role})</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="label">Tanggal Realisasi</label>
            <input type="date" className="inputField" value={tanggal} onChange={e => setTanggal(e.target.value)} required />
          </div>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="label">Jenis Realisasi</label>
            <div style={{ display: 'flex', gap: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="radio" name="jenis" value="BARU" checked={jenis === 'BARU'} onChange={() => setJenis('BARU')} />
                Realisasi Baru
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="radio" name="jenis" value="TOP_UP" checked={jenis === 'TOP_UP'} onChange={() => setJenis('TOP_UP')} />
                Top Up
              </label>
            </div>
          </div>

          <div className="grid" style={{ gridTemplateColumns: jenis === 'TOP_UP' ? '1fr 1fr' : '1fr', gap: 16, marginBottom: 24 }}>
            <div className="form-group">
              <label className="label">Nominal Realisasi (Plafon Baru)</label>
              <CurrencyInput 
                value={nominalRealisasi} 
                onChange={setNominalRealisasi} 
                placeholder="Rp 0"
                required 
              />
            </div>
            
            {jenis === 'TOP_UP' && (
              <div className="form-group">
                <label className="label">Saldo Akhir (Pinjaman Lama)</label>
                <CurrencyInput 
                  value={saldoAkhir} 
                  onChange={setSaldoAkhir} 
                  placeholder="Rp 0"
                  required={jenis === 'TOP_UP'}
                />
              </div>
            )}
          </div>

          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ background: '#e2e8f0', padding: 12, borderRadius: '50%', color: '#475569' }}>
              <Calculator size={24} />
            </div>
            <div>
              <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>
                Pencapaian KPI Anda
              </div>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#0f172a' }}>
                {formatCurrency(getNominalNet())}
              </div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                {jenis === 'TOP_UP' ? 'Dihitung dari (Plafon Baru - Saldo Akhir)' : 'Dihitung penuh dari Plafon Baru'}
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="label">Keterangan / Nama Nasabah (Opsional)</label>
            <textarea 
              className="inputField" 
              value={keterangan} 
              onChange={e => setKeterangan(e.target.value)} 
              placeholder="Contoh: Pencairan nasabah Budi (Top Up)"
              rows={3}
            />
          </div>

          <button type="submit" className="button" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
            Simpan Realisasi
          </button>
        </form>
      </section>
    </main>
  );
}
