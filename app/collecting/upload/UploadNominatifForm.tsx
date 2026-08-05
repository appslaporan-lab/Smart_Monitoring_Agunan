'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const BULAN_LIST = [
  { value: 1, label: 'Januari' }, { value: 2, label: 'Februari' }, { value: 3, label: 'Maret' },
  { value: 4, label: 'April' }, { value: 5, label: 'Mei' }, { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' }, { value: 8, label: 'Agustus' }, { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' }, { value: 11, label: 'November' }, { value: 12, label: 'Desember' },
];

export default function UploadNominatifForm() {
  const router = useRouter();
  const now = new Date();
  const [bulan, setBulan] = useState(now.getMonth() + 1);
  const [tahun, setTahun] = useState(now.getFullYear());
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage('Pilih file nominatif.xlsx terlebih dahulu.');
      return;
    }
    setLoading(true);
    setStatusMessage(null);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('bulan', String(bulan));
    formData.append('tahun', String(tahun));

    try {
      const res = await fetch('/api/collecting/upload-nominatif', { method: 'POST', body: formData });
      const result = await res.json();

      if (!res.ok) {
        setErrorMessage(result.error || 'Gagal upload.');
        setLoading(false);
        return;
      }

      setStatusMessage(`Berhasil! ${result.totalDiimport} baris diimport, ${result.totalDilewati} baris dilewati (dari total ${result.totalBarisAsli} baris).`);
      setTimeout(() => router.refresh(), 1500);
    } catch (err) {
      setErrorMessage('Terjadi kesalahan saat menghubungkan server.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {statusMessage && <div className="alert alert-info">{statusMessage}</div>}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label className="label">Bulan</label>
          <select className="inputField" value={bulan} onChange={(e) => setBulan(Number(e.target.value))}>
            {BULAN_LIST.map((b) => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Tahun</label>
          <input className="inputField" type="number" value={tahun} onChange={(e) => setTahun(Number(e.target.value))} />
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label className="label">File Nominatif (.xlsx)</label>
        <input
          className="inputField"
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>

      <button type="submit" className="button" disabled={loading}>
        {loading ? 'Mengupload & Memproses...' : 'Upload Nominatif'}
      </button>
    </form>
  );
}