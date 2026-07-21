'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Item = {
  id: number;
  kodeRegister: string;
  jenis: string;
  namaNasabah: string;
  jenisPengajuanLabel: string;
  diajukanOleh: string;
  catatan: string | null;
  langkahSaatIni: number;
  totalLangkah: number;
};

export default function ApprovalList({ items }: { items: Item[] }) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  const handleAction = async (id: number, keputusan: 'setuju' | 'tolak') => {
    setProcessingId(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/pengajuan-keluar/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keputusan, catatan: notes[id] || '' }),
      });
      const result = await res.json();
      if (!res.ok) {
        setMessage(result.error || 'Gagal memproses.');
        setProcessingId(null);
        return;
      }
      setMessage('Berhasil diproses.');
      setTimeout(() => router.refresh(), 1000);
    } catch (error) {
      setMessage('Terjadi kesalahan.');
      setProcessingId(null);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {message && <div className="alert alert-info">{message}</div>}
      {items.map((item) => (
        <div key={item.id} className="card" style={{ padding: 18 }}>
          <strong>{item.kodeRegister}</strong> — {item.jenis}
          <p>Nasabah: {item.namaNasabah}</p>
          <p>Jenis Pengajuan: {item.jenisPengajuanLabel}</p>
          <p>Diajukan oleh: {item.diajukanOleh}</p>
          <p>Langkah: {item.langkahSaatIni} dari {item.totalLangkah}</p>
          {item.catatan && <p>Catatan Pengaju: {item.catatan}</p>}

          <textarea
            className="inputField"
            placeholder="Catatan approval (opsional)"
            rows={2}
            style={{ marginTop: 10 }}
            value={notes[item.id] || ''}
            onChange={(e) => setNotes((cur) => ({ ...cur, [item.id]: e.target.value }))}
          />

          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button
              type="button"
              className="button"
              disabled={processingId === item.id}
              onClick={() => handleAction(item.id, 'setuju')}
            >
              Setujui
            </button>
            <button
              type="button"
              className="button secondary"
              disabled={processingId === item.id}
              onClick={() => handleAction(item.id, 'tolak')}
            >
              Tolak
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}