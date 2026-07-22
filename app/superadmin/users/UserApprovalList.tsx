'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Item = { id: number; nama: string; username: string; role: string };

export default function UserApprovalList({ items }: { items: Item[] }) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAction = async (id: number, decision: 'approve' | 'reject') => {
    setProcessingId(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/superadmin/users/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      });
      const result = await res.json();
      if (!res.ok) {
        setMessage(result.error || 'Gagal memproses.');
        setProcessingId(null);
        return;
      }
      setMessage('Berhasil diproses.');
      setTimeout(() => router.refresh(), 800);
    } catch {
      setMessage('Terjadi kesalahan.');
      setProcessingId(null);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
      {message && <div className="alert alert-info">{message}</div>}
      {items.map((item) => (
        <div key={item.id} className="card" style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <strong>{item.nama}</strong> — {item.username}
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{item.role}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="button" disabled={processingId === item.id} onClick={() => handleAction(item.id, 'approve')}>
              Setujui
            </button>
            <button type="button" className="button secondary" disabled={processingId === item.id} onClick={() => handleAction(item.id, 'reject')}>
              Tolak
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}