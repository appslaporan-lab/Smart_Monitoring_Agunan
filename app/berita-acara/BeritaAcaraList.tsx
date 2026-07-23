'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

type BeritaAcaraWithAgunan = {
  id: number;
  nomorDokumen: string;
  nomorRegister: string;
  namaNasabah: string;
  tanggalLunas: Date | null;
  jenisAgunan: string;
  createdAt: Date;
  agunan: {
    id: number;
    kodeRegister: string;
  } | null;
  isManual?: boolean;
};

export default function BeritaAcaraList({ beritaAcaras }: { beritaAcaras: BeritaAcaraWithAgunan[] }) {
  const [items, setItems] = useState(beritaAcaras);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJenisAgunan, setSelectedJenisAgunan] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const jenisAgunanOptions = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.jenisAgunan))).sort();
  }, [items]);

  const filteredAcaras = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return items.filter((item) => {
      if (selectedJenisAgunan && item.jenisAgunan !== selectedJenisAgunan) {
        return false;
      }

      const tanggalLunasValue = item.tanggalLunas ? item.tanggalLunas.toISOString().split('T')[0] : '';
      if (startDate && tanggalLunasValue < startDate) {
        return false;
      }
      if (endDate && tanggalLunasValue > endDate) {
        return false;
      }

      if (!query) {
        return true;
      }

      const normalized = [
        item.nomorDokumen,
        item.nomorRegister,
        item.namaNasabah,
        item.jenisAgunan,
        item.agunan?.kodeRegister || '',
      ]
        .join(' ')
        .toLowerCase();

      return normalized.includes(query);
    });
  }, [items, searchQuery, selectedJenisAgunan, startDate, endDate]);

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('Hapus berita acara ini? Tindakan ini tidak dapat dibatalkan.');
    if (!confirmed) return;

    setStatusMessage(null);
    const response = await fetch(`/api/berita-acara/${id}`, { method: 'DELETE' });
    const result = await response.json();

    if (!response.ok) {
      setStatusMessage(result.error || 'Gagal menghapus berita acara.');
      return;
    }

    setItems((current) => current.filter((item) => item.id !== id));
    setStatusMessage('Berita acara berhasil dihapus.');
  };

  return (
    <div className="card" style={{ padding: 24, marginTop: 24 }}>
      <div style={{ display: 'grid', gap: 12, marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="search"
            className="inputField"
            placeholder="Cari nomor dokumen, nama nasabah, atau jenis agunan..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            style={{ flex: 1, minWidth: 220 }}
          />
          <button type="button" className="button">
            Cari
          </button>
          <button type="button" className="button secondary" onClick={() => setSearchQuery('')}>
            Reset
          </button>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            Filter Jenis Agunan
            <select
              className="inputField"
              value={selectedJenisAgunan}
              onChange={(event) => setSelectedJenisAgunan(event.target.value)}
            >
              <option value="">Semua Jenis</option>
              {jenisAgunanOptions.map((jenis) => (
                <option key={jenis} value={jenis}>{jenis}</option>
              ))}
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            Tanggal Lunas mulai
            <input type="date" className="inputField" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            sampai
            <input type="date" className="inputField" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          </label>
          <button type="button" className="button secondary" onClick={() => {
            setSearchQuery('');
            setSelectedJenisAgunan('');
            setStartDate('');
            setEndDate('');
          }}>
            Bersihkan Filter
          </button>
        </div>
      </div>
      {statusMessage && <div className="alert alert-info" style={{ marginBottom: 18 }}>{statusMessage}</div>}
      {filteredAcaras.length === 0 ? (
        <p>{items.length === 0 ? 'Belum ada berita acara tersimpan.' : 'Tidak ada berita acara yang cocok dengan pencarian.'}</p>
      ) : (
        <div style={{ display: 'grid', gap: 18 }}>
          {filteredAcaras.map((item) => (
            <article key={item.id} className="card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
                <div>
                  <h2>{item.nomorDokumen}</h2>
                  <p>{item.namaNasabah} | {item.nomorRegister}</p>
                  <p>{item.jenisAgunan} | Tgl. Lunas: {item.tanggalLunas ? new Date(item.tanggalLunas).toLocaleDateString('id-ID') : '-'}</p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Link href={`/berita-acara/${item.id}/edit`} className="button secondary">Edit</Link>
                  {item.agunan ? (
                    <Link href={`/agunan/${item.agunan.id}/berita-acara/formal`} className="button">Lihat Cetak</Link>
                  ) : (
                    <span className="status-pill status-pending">Manual</span>
                  )}
                  <button className="button danger" type="button" onClick={() => handleDelete(item.id)}>
                    Hapus
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
