'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

type Nasabah = {
  id: number;
  nama: string;
  nik: string;
  alamat: string | null;
  telepon: string | null;
};

export default function CreateAgunanForm({ nasabahs }: { nasabahs: Nasabah[] }) {
  const router = useRouter();
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [selectedNasabahId, setSelectedNasabahId] = useState('');
  const [form, setForm] = useState({
    kodeRegister: '',
    jenis: 'BPKB',
    status: 'PENDING',
    deskripsi: '',
    tujuan: '',
    keluarDariBrankas: false,
    keluarOleh: '',
    tanggalKeluar: '',
    diserahkanKeNasabah: false,
    diserahkanOleh: '',
    tanggalSerah: '',
    warningPesan: '',
    her5Reminder: '',
    nomorPolisi: '',
    namaPemilik: '',
    noRangka: '',
    noMesin: '',
  });
  const [newNasabah, setNewNasabah] = useState({ nama: '', nik: '', alamat: '', telepon: '' });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateField = (key: string, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateNewNasabah = (key: string, value: string) => {
    setNewNasabah((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);

    const payload: any = {
      kodeRegister: form.kodeRegister,
      jenis: form.jenis,
      status: form.status,
      deskripsi: form.deskripsi,
      tujuan: form.tujuan,
      keluarDariBrankas: form.keluarDariBrankas,
      keluarOleh: form.keluarOleh,
      tanggalKeluar: form.tanggalKeluar || null,
      diserahkanKeNasabah: form.diserahkanKeNasabah,
      diserahkanOleh: form.diserahkanOleh,
      tanggalSerah: form.tanggalSerah || null,
      warningPesan: form.warningPesan,
      her5Reminder: form.her5Reminder || null,
      nomorPolisi: form.nomorPolisi,
      namaPemilik: form.namaPemilik,
      noRangka: form.noRangka,
      noMesin: form.noMesin,
    };

    if (mode === 'existing') {
      payload.nasabahId = Number(selectedNasabahId) || undefined;
    } else {
      payload.newNasabah = {
        nama: newNasabah.nama,
        nik: newNasabah.nik,
        alamat: newNasabah.alamat,
        telepon: newNasabah.telepon,
      };
    }

    try {
      const res = await fetch('/api/agunan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (!res.ok) {
        setErrorMessage(result.error || 'Gagal menyimpan agunan.');
        return;
      }

      setStatusMessage('Agunan berhasil disimpan.');
      setTimeout(() => router.push('/'), 1000);
    } catch (error) {
      setErrorMessage('Terjadi kesalahan saat menghubungkan server.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid" style={{ gap: 18 }}>
      {statusMessage && <div className="alert alert-info">{statusMessage}</div>}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      <div>
        <label className="label">Pilih Nasabah</label>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button type="button" className={`button secondary`} onClick={() => setMode('existing')}>
            Nasabah Terdaftar
          </button>
          <button type="button" className="button" onClick={() => setMode('new')}>
            Nasabah Baru
          </button>
        </div>
      </div>

      {mode === 'existing' ? (
        <div>
          <label className="label">Nasabah Terpilih</label>
          <select
            className="inputField"
            value={selectedNasabahId}
            onChange={(event) => setSelectedNasabahId(event.target.value)}
          >
            <option value="">Pilih nasabah</option>
            {nasabahs.map((nasabah) => (
              <option key={nasabah.id} value={nasabah.id}>
                {nasabah.nama} — {nasabah.nik}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="grid">
          <div>
            <label className="label">Nama Nasabah</label>
            <input
              className="inputField"
              value={newNasabah.nama}
              onChange={(event) => updateNewNasabah('nama', event.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">NIK</label>
            <input
              className="inputField"
              value={newNasabah.nik}
              onChange={(event) => updateNewNasabah('nik', event.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Alamat</label>
            <input
              className="inputField"
              value={newNasabah.alamat}
              onChange={(event) => updateNewNasabah('alamat', event.target.value)}
            />
          </div>
          <div>
            <label className="label">Telepon</label>
            <input
              className="inputField"
              value={newNasabah.telepon}
              onChange={(event) => updateNewNasabah('telepon', event.target.value)}
            />
          </div>
        </div>
      )}

      <div>
        <label className="label">Kode Register Agunan</label>
        <input
          className="inputField"
          value={form.kodeRegister}
          onChange={(event) => updateField('kodeRegister', event.target.value)}
          placeholder="Contoh: AGN-2026-001"
          required
        />
      </div>

      <div>
        <label className="label">Jenis Agunan</label>
        <select
          className="inputField"
          value={form.jenis}
          onChange={(event) => updateField('jenis', event.target.value)}
        >
          <option value="BPKB">BPKB</option>
          <option value="SERTIFIKAT">SERTIFIKAT</option>
          <option value="EMAS">EMAS</option>
          <option value="KENDARAAN">KENDARAAN</option>
          <option value="LAINNYA">LAINNYA</option>
        </select>
      </div>

      <div>
        <label className="label">Status Agunan</label>
        <select
          className="inputField"
          value={form.status}
          onChange={(event) => updateField('status', event.target.value)}
        >
          <option value="PENDING">PENDING</option>
          <option value="DIKELUARKAN">DIKELUARKAN</option>
          <option value="DISETUJUI_OPERASIONAL">DISETUJUI - Operasional</option>
          <option value="DISETUJUI_PIMPINAN">DISETUJUI - Pimpinan</option>
          <option value="TRANSFER_CABANG">TRANSFER CABANG</option>
          <option value="RE_DISBURSE">RE-DISBURSE</option>
          <option value="DISERAHKAN">DISERAHKAN</option>
          <option value="KEMBALI">KEMBALI</option>
        </select>
      </div>

      <div>
        <label className="label">Deskripsi Agunan</label>
        <textarea
          className="inputField"
          value={form.deskripsi}
          onChange={(event) => updateField('deskripsi', event.target.value)}
          rows={4}
          required
        />
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label className="label">Nomor Polisi</label>
          <input
            className="inputField"
            value={form.nomorPolisi}
            onChange={(event) => updateField('nomorPolisi', event.target.value)}
          />
        </div>
        <div>
          <label className="label">Nama Pemilik</label>
          <input
            className="inputField"
            value={form.namaPemilik}
            onChange={(event) => updateField('namaPemilik', event.target.value)}
          />
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label className="label">No Rangka</label>
          <input
            className="inputField"
            value={form.noRangka}
            onChange={(event) => updateField('noRangka', event.target.value)}
          />
        </div>
        <div>
          <label className="label">No Mesin</label>
          <input
            className="inputField"
            value={form.noMesin}
            onChange={(event) => updateField('noMesin', event.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="label">Tujuan / Keterangan</label>
        <input
          className="inputField"
          value={form.tujuan}
          onChange={(event) => updateField('tujuan', event.target.value)}
          placeholder="Contoh: Pencairan ulang, HER 5 tahun, pengembalian"
        />
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        <label className="label">Status Keluar</label>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <label>
            <input
              type="checkbox"
              checked={form.keluarDariBrankas}
              onChange={(event) => updateField('keluarDariBrankas', event.target.checked)}
            />
            {' '}Keluar dari brankas
          </label>
          <label>
            <input
              type="checkbox"
              checked={form.diserahkanKeNasabah}
              onChange={(event) => updateField('diserahkanKeNasabah', event.target.checked)}
            />
            {' '}Diserahkan ke nasabah
          </label>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label className="label">Tanggal Keluar</label>
          <input
            className="inputField"
            type="date"
            value={form.tanggalKeluar}
            onChange={(event) => updateField('tanggalKeluar', event.target.value)}
          />
        </div>
        <div>
          <label className="label">Tanggal Serah</label>
          <input
            className="inputField"
            type="date"
            value={form.tanggalSerah}
            onChange={(event) => updateField('tanggalSerah', event.target.value)}
          />
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label className="label">Keluar Oleh</label>
          <input
            className="inputField"
            value={form.keluarOleh}
            onChange={(event) => updateField('keluarOleh', event.target.value)}
            placeholder="Contoh: Adm Kredit, Kepala Kas"
          />
        </div>
        <div>
          <label className="label">Diserahkan Oleh</label>
          <input
            className="inputField"
            value={form.diserahkanOleh}
            onChange={(event) => updateField('diserahkanOleh', event.target.value)}
            placeholder="Contoh: Adm Kredit, Cabang"
          />
        </div>
      </div>

      <div>
        <label className="label">Peringatan / Catatan</label>
        <textarea
          className="inputField"
          value={form.warningPesan}
          onChange={(event) => updateField('warningPesan', event.target.value)}
          rows={3}
        />
      </div>

      <div>
        <label className="label">Pengingat BPKB HER 5 Tahunan</label>
        <input
          className="inputField"
          type="date"
          value={form.her5Reminder}
          onChange={(event) => updateField('her5Reminder', event.target.value)}
        />
      </div>

      <button type="submit" className="button">
        Simpan Agunan
      </button>
    </form>
  );
}
