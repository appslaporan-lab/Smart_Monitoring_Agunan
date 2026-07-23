'use client';

import { useState } from 'react';
import Link from 'next/link';

type Agunan = {
  id: number;
  kodeRegister: string;
  jenis: string;
  status: string;
  deskripsi: string | null;
};

type Nasabah = {
  id: number;
  nama: string;
  nik: string;
  agunans: Agunan[];
};

export default function CariAgunanForm() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Nasabah[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (query.length < 2) return;
    const res = await fetch(`/api/berita-acara/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setResults(data.results || []);
    setSearched(true);
  };

  return (
    <div className="card" style={{ padding: 24, marginBottom: 24 }}>
      <h2 style={{ marginTop: 0 }}>Cari Agunan untuk Buat Berita Acara</h2>
      <p style={{ color: '#64748b', marginTop: 0 }}>Cari berdasarkan nama nasabah atau nomor rekening.</p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input
          className="inputField"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Ketik nama nasabah atau nomor rekening..."
          style={{ flex: 1 }}
        />
        <button type="button" className="button" onClick={handleSearch}>Cari</button>
      </div>

      {searched && results.length === 0 && (
        <p style={{ color: '#94a3b8' }}>Tidak ditemukan nasabah dengan kata kunci tersebut.</p>
      )}

      {results.length > 0 && (
        <div style={{ display: 'grid', gap: 14 }}>
          {results.map((n) => (
            <div key={n.id} className="card" style={{ padding: 16, background: '#f8fafc' }}>
              <strong>{n.nama}</strong> — {n.nik}
              <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
                {n.agunans.length === 0 ? (
                  <p style={{ color: '#94a3b8', margin: 0 }}>Belum ada agunan.</p>
                ) : (
                  n.agunans.map((a) => (
                    <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, borderTop: '1px solid #e2e8f0', paddingTop: 10 }}>
                      <span>
                        <strong>{a.kodeRegister}</strong> — {a.jenis} — {a.deskripsi || '-'}
                        <span className="status-pill status-pending" style={{ marginLeft: 8 }}>{a.status.replace(/_/g, ' ')}</span>
                      </span>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <Link href={`/agunan/${a.id}/berita-acara/formal`} className="button" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                          Berita Acara Formal
                        </Link>
                        <Link href={`/agunan/${a.id}/berita-acara-transfer`} className="button secondary" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                          Transfer Cabang
                        </Link>
                        <Link href={`/agunan/${a.id}/berita-acara-pencairan`} className="button secondary" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                          Pencairan Ulang
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}