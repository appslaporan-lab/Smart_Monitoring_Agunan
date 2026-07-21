'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HerKembaliForm({ agunanId }: { agunanId: number }) {
  const router = useRouter();
  const [jenisKembali, setJenisKembali] = useState('STNK');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/agunan/${agunanId}/her-kembali`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jenisKembali }),
      });
      const result = await res.json();
      if (!res.ok) {
        setMessage(result.error || 'Gagal memproses.');
        setLoading(false);
        return;
      }
      setMessage('Berhasil dicatat.');
      setTimeout(() => router.refresh(), 800);
    } catch {
      setMessage('Terjadi kesalahan jaringan.');
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: 16, background: '#f8fafc', marginTop: 12 }}>
      <h3 style={{ margin: '0 0 12px', fontSize: '0.95rem' }}>Tandai Kembali dari HER</h3>
      {message && <div className="alert alert-info" style={{ marginBottom: 10 }}>{message}</div>}
      <label className="label">Yang Kembali</label>
      <select className="inputField" value={jenisKembali} onChange={(e) => setJenisKembali(e.target.value)}>
        <option value="STNK">STNK / Notice (BPKB baru masih di Samsat)</option>
        <option value="BPKB">BPKB (sudah selesai, kembali ke brankas)</option>
      </select>
      <button type="button" className="button" style={{ marginTop: 12 }} onClick={handleSubmit} disabled={loading}>
        {loading ? 'Memproses...' : 'Simpan'}
      </button>
    </div>
  );
}