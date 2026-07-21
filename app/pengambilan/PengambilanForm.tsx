'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Agunan = {
  id: number;
  kodeRegister: string;
  jenis: string;
  deskripsi: string | null;
  status: string;
  nomorPolisi: string | null;
  nomorSHM: string | null;
  nomorBPKB: string | null;
};

type Nasabah = {
  id: number;
  nama: string;
  nik: string;
  agunans: Agunan[];
  registrasis: Array<{ id: number; kodeRegister: string; nomorRekening: string | null }>;
};

const JENIS_OPTIONS_PUSAT = [
  { value: 'LUNAS_LANGSUNG', label: 'Lunas - Serah Langsung' },
  { value: 'LUNAS_TRANSFER_PUSAT_KE_CABANG', label: 'Lunas - Transfer ke Cabang' },
  { value: 'HER_5_TAHUN', label: 'HER 5 Tahunan' },
];

const JENIS_OPTIONS_CABANG = [
  { value: 'LUNAS_LANGSUNG', label: 'Lunas - Serah Langsung' },
  { value: 'LUNAS_TRANSFER_CABANG_KE_CABANG', label: 'Lunas - Transfer ke Cabang Lain' },
  { value: 'HER_5_TAHUN', label: 'HER 5 Tahunan' },
];

const JENIS_OPTIONS_KEPALA_KAS = [
  { value: 'PENCAIRAN_ULANG', label: 'Pencairan Ulang' },
];

export default function PengambilanForm({ userRole }: { userRole: string }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Nasabah[]>([]);
  const [selectedAgunan, setSelectedAgunan] = useState<Agunan | null>(null);
  const [selectedNasabah, setSelectedNasabah] = useState<Nasabah | null>(null);
  const [jenisPengajuan, setJenisPengajuan] = useState('');
  const [catatan, setCatatan] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const jenisOptions =
    userRole === 'KEPALA_KAS' ? JENIS_OPTIONS_KEPALA_KAS :
    userRole === 'ADM_KREDIT_PUSAT' ? JENIS_OPTIONS_PUSAT :
    userRole === 'ADM_KREDIT_CABANG' ? JENIS_OPTIONS_CABANG :
    [...JENIS_OPTIONS_PUSAT, ...JENIS_OPTIONS_KEPALA_KAS];

  const handleSearch = async () => {
    if (query.length < 2) return;
    const res = await fetch(`/api/pengambilan/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setResults(data.results || []);
  };

  const handleSubmit = async () => {
    if (!selectedAgunan || !jenisPengajuan) {
      setErrorMessage('Pilih agunan dan jenis pengajuan terlebih dahulu.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/pengajuan-keluar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agunanId: selectedAgunan.id, jenisPengajuan, catatan }),
      });
      const result = await res.json();

      if (!res.ok) {
        setErrorMessage(result.error || 'Gagal membuat pengajuan.');
        setLoading(false);
        return;
      }

      setStatusMessage('Pengajuan berhasil dibuat. Status agunan sekarang: Proses Keluar.');
      setTimeout(() => router.push(`/agunan/${selectedAgunan.id}`), 1500);
    } catch (error) {
      setErrorMessage('Terjadi kesalahan saat menghubungkan server.');
      setLoading(false);
    }
  };

  return (
    <div className="grid" style={{ gap: 20 }}>
      {statusMessage && <div className="alert alert-info">{statusMessage}</div>}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      <div>
        <label className="label">Cari Nasabah (Nama atau Nomor Rekening)</label>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            className="inputField"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik minimal 2 karakter"
          />
          <button type="button" className="button" onClick={handleSearch}>Cari</button>
        </div>
      </div>

      {results.length > 0 && (
        <div style={{ display: 'grid', gap: 12 }}>
          {results.map((n) => (
            <div key={n.id} className="card" style={{ padding: 16 }}>
              <strong>{n.nama}</strong> — {n.nik}
              <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
                {n.agunans.length === 0 ? (
                  <p style={{ color: '#94a3b8' }}>Tidak ada agunan berstatus Di Brankas.</p>
                ) : (
                  n.agunans.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      className={`button ${selectedAgunan?.id === a.id ? '' : 'secondary'}`}
                      onClick={() => { setSelectedAgunan(a); setSelectedNasabah(n); }}
                      style={{ textAlign: 'left' }}
                    >
                      {a.kodeRegister} — {a.jenis} — {a.deskripsi || a.nomorPolisi || a.nomorSHM || a.nomorBPKB || '-'}
                    </button>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedAgunan && (
        <div className="card" style={{ padding: 18, background: '#f8fafc' }}>
          <h3>Agunan Terpilih</h3>
          <p>{selectedAgunan.kodeRegister} — {selectedAgunan.jenis}</p>
          <p>Nasabah: {selectedNasabah?.nama}</p>

          <div style={{ marginTop: 16 }}>
            <label className="label">Jenis Pengajuan</label>
            <select className="inputField" value={jenisPengajuan} onChange={(e) => setJenisPengajuan(e.target.value)}>
              <option value="">Pilih jenis pengajuan</option>
              {jenisOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: 16 }}>
            <label className="label">Catatan</label>
            <textarea className="inputField" value={catatan} onChange={(e) => setCatatan(e.target.value)} rows={3} />
          </div>

          <button type="button" className="button" style={{ marginTop: 16 }} onClick={handleSubmit} disabled={loading}>
            {loading ? 'Memproses...' : 'Ajukan'}
          </button>
        </div>
      )}
    </div>
  );
}