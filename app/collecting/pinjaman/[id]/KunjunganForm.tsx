'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const HASIL_OPTIONS = [
  { value: 'JANJI_BAYAR', label: 'Janji Bayar' },
  { value: 'BAYAR_SEBAGIAN', label: 'Bayar Sebagian' },
  { value: 'LUNAS', label: 'Lunas' },
  { value: 'TIDAK_KETEMU', label: 'Tidak Ketemu' },
  { value: 'MENOLAK', label: 'Menolak Bayar' },
];

export default function KunjunganForm({ pinjamanPeriodeId }: { pinjamanPeriodeId: number }) {
  const router = useRouter();
  const [tanggalKunjungan, setTanggalKunjungan] = useState(new Date().toISOString().split('T')[0]);
  const [jenisKontak, setJenisKontak] = useState('KUNJUNGAN');
  const [hasil, setHasil] = useState('');
  const [nominalDibayar, setNominalDibayar] = useState('');
  const [tanggalJanjiBayar, setTanggalJanjiBayar] = useState('');
  const [catatan, setCatatan] = useState('');
  const [penerimaSurat, setPenerimaSurat] = useState('');
  const [fotoDataUrl, setFotoDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setFotoDataUrl(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setFotoDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasil) {
      setStatusMessage('Pilih hasil kunjungan terlebih dahulu.');
      return;
    }
    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/collecting/kunjungan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pinjamanPeriodeId,
          tanggalKunjungan,
          jenisKontak,
          hasil,
          nominalDibayar: nominalDibayar || null,
          tanggalJanjiBayar: tanggalJanjiBayar || null,
          catatan,
          fotoDataUrl,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setStatusMessage(result.error || 'Gagal menyimpan.');
        setLoading(false);
        return;
      }
      setStatusMessage('Kunjungan berhasil dicatat.');
      setTimeout(() => router.refresh(), 800);
    } catch {
      setStatusMessage('Terjadi kesalahan jaringan.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {statusMessage && <div className="alert alert-info">{statusMessage}</div>}

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label className="label">Tanggal Kunjungan/Kontak</label>
          <input className="inputField" type="date" value={tanggalKunjungan} onChange={(e) => setTanggalKunjungan(e.target.value)} required />
        </div>
        <div>
          <label className="label">Jenis Kontak</label>
          <select className="inputField" value={jenisKontak} onChange={(e) => setJenisKontak(e.target.value)}>
            <option value="KUNJUNGAN">Kunjungan Langsung</option>
            <option value="TELEPON">Telepon</option>
            <option value="SURAT_TAGIHAN_1">Kirim Surat Tagihan 1</option>
            <option value="SURAT_TAGIHAN_2">Kirim Surat Tagihan 2</option>
            <option value="SP_1">Kirim Surat Peringatan 1</option>
            <option value="SP_2">Kirim Surat Peringatan 2</option>
            <option value="SP_3">Kirim Surat Peringatan 3</option>
          </select>
        </div>
        { (jenisKontak.includes('SURAT') || jenisKontak.includes('SP')) && (
          <div>
            <label className="label">Diterima Oleh (Nama / Hubungan)</label>
            <input className="inputField" type="text" value={penerimaSurat} onChange={(e) => setPenerimaSurat(e.target.value)} placeholder="Contoh: Istri (Ibu Budi)" required />
          </div>
        ) }
        <div>
          <label className="label">Hasil</label>
          <select className="inputField" value={hasil} onChange={(e) => setHasil(e.target.value)} required>
            <option value="">Pilih hasil</option>
            {HASIL_OPTIONS.map((h) => (
              <option key={h.value} value={h.value}>{h.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Nominal Dibayar (jika ada)</label>
          <input className="inputField" type="number" value={nominalDibayar} onChange={(e) => setNominalDibayar(e.target.value)} />
        </div>
        <div>
          <label className="label">Tanggal Janji Bayar (jika ada)</label>
          <input className="inputField" type="date" value={tanggalJanjiBayar} onChange={(e) => setTanggalJanjiBayar(e.target.value)} />
        </div>
        <div>
          <label className="label">Foto Dokumentasi (opsional)</label>
          <input className="inputField" type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} />
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label className="label">Catatan</label>
        <textarea className="inputField" rows={3} value={catatan} onChange={(e) => setCatatan(e.target.value)} />
      </div>

      <button type="submit" className="button" disabled={loading}>
        {loading ? 'Menyimpan...' : 'Simpan Kunjungan'}
      </button>
    </form>
  );
}