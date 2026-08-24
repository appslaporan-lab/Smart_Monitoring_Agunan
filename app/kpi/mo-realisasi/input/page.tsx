'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';

export default function InputRealisasiMOPage() {
  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [nominal, setNominal] = useState<string>('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nominal || isNaN(Number(nominal))) {
      setError('Nominal tidak valid');
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
          nominal: Number(nominal),
          keterangan,
          targetUserId: targetUserId || undefined
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Terjadi kesalahan sistem');

      setSuccess('Data realisasi harian berhasil disimpan!');
      setNominal('');
      setKeterangan('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container" style={{ maxWidth: 600 }}>
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
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="label">Nama MO (Akses Superadmin)</label>
              <select className="inputField" value={targetUserId} onChange={e => setTargetUserId(e.target.value)}>
                <option value="">-- Diri Sendiri --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.nama} ({u.role})</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="label">Tanggal Realisasi</label>
            <input type="date" className="inputField" value={tanggal} onChange={e => setTanggal(e.target.value)} required />
          </div>

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="label">Nominal Realisasi (Rp)</label>
            <input 
              type="number" 
              className="inputField" 
              value={nominal} 
              onChange={e => setNominal(e.target.value)} 
              placeholder="Contoh: 150000000"
              required 
            />
          </div>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="label">Keterangan / Nama Nasabah (Opsional)</label>
            <textarea 
              className="inputField" 
              value={keterangan} 
              onChange={e => setKeterangan(e.target.value)} 
              placeholder="Contoh: Pencairan nasabah A, B, C..."
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
