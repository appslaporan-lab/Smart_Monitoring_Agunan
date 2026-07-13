'use client';

import { useState } from 'react';

type BeritaAcaraEdit = {
  id: number;
  agunanId: number;
  nomorDokumen: string;
  nomorRegister: string;
  namaNasabah: string;
  alamat: string | null;
  nomorRekening: string | null;
  tanggalLunas: Date | null;
  jenisAgunan: string;
  photoDataUrl: string | null;
  yangMenyerahkan: string;
  menyetujui: string;
  yangMenerima: string;
};

export default function EditBeritaAcaraForm({ beritaAcara }: { beritaAcara: BeritaAcaraEdit }) {
  const [form, setForm] = useState({
    nomorDokumen: beritaAcara.nomorDokumen,
    nomorRegister: beritaAcara.nomorRegister,
    namaNasabah: beritaAcara.namaNasabah,
    alamat: beritaAcara.alamat ?? '',
    nomorRekening: beritaAcara.nomorRekening ?? '',
    tanggalLunas: beritaAcara.tanggalLunas ? beritaAcara.tanggalLunas.toISOString().split('T')[0] : '',
    jenisAgunan: beritaAcara.jenisAgunan,
    yangMenyerahkan: beritaAcara.yangMenyerahkan,
    menyetujui: beritaAcara.menyetujui,
    yangMenerima: beritaAcara.yangMenerima,
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(beritaAcara.photoDataUrl || null);

  const updateField = (field: string, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const saveChanges = async () => {
    setStatusMessage(null);
    const response = await fetch(`/api/berita-acara/${beritaAcara.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nomorDokumen: form.nomorDokumen,
        namaNasabah: form.namaNasabah,
        alamat: form.alamat,
        nomorRekening: form.nomorRekening,
        tanggalLunas: form.tanggalLunas,
        jenisAgunan: form.jenisAgunan,
        photoDataUrl: photoPreview,
        yangMenyerahkan: form.yangMenyerahkan,
        menyetujui: form.menyetujui,
        yangMenerima: form.yangMenerima,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      setStatusMessage(result.error || 'Gagal memperbarui berita acara.');
      return;
    }

    setStatusMessage('Perubahan berita acara berhasil disimpan.');
  };

  return (
    <div className="card" style={{ padding: 24, marginTop: 24 }}>
      {statusMessage && <div className="alert alert-info">{statusMessage}</div>}
      <div className="grid" style={{ gap: 18 }}>
        <div>
          <label className="label">Nomor Dokumen</label>
          <input className="inputField" value={form.nomorDokumen} onChange={(event) => updateField('nomorDokumen', event.target.value)} />
        </div>
        <div>
          <label className="label">Nama Nasabah</label>
          <input className="inputField" value={form.namaNasabah} onChange={(event) => updateField('namaNasabah', event.target.value)} />
        </div>
        <div>
          <label className="label">Alamat</label>
          <input className="inputField" value={form.alamat} onChange={(event) => updateField('alamat', event.target.value)} />
        </div>
        <div>
          <label className="label">Nomor Rekening</label>
          <input className="inputField" value={form.nomorRekening} onChange={(event) => updateField('nomorRekening', event.target.value)} />
        </div>
        <div>
          <label className="label">Tanggal Lunas</label>
          <input className="inputField" type="date" value={form.tanggalLunas} onChange={(event) => updateField('tanggalLunas', event.target.value)} />
        </div>
        <div>
          <label className="label">Jenis Agunan</label>
          <input className="inputField" value={form.jenisAgunan} readOnly />
        </div>
        <div>
          <label className="label">Foto Penyerahan</label>
          <input className="inputField" type="file" accept="image/*" onChange={handlePhotoChange} />
        </div>
        <div className="formal-photo-preview" style={{ marginTop: 12 }}>
          {photoPreview ? <img src={photoPreview} alt="Foto penyerahan" /> : <p>Belum ada foto.</p>}
        </div>
        <div>
          <label className="label">Yang Menyerahkan</label>
          <input className="inputField" value={form.yangMenyerahkan} onChange={(event) => updateField('yangMenyerahkan', event.target.value)} />
        </div>
        <div>
          <label className="label">Menyetujui</label>
          <input className="inputField" value={form.menyetujui} onChange={(event) => updateField('menyetujui', event.target.value)} />
        </div>
        <div>
          <label className="label">Yang Menerima</label>
          <input className="inputField" value={form.yangMenerima} onChange={(event) => updateField('yangMenerima', event.target.value)} />
        </div>
      </div>
      <button className="button" type="button" onClick={saveChanges} style={{ marginTop: 18 }}>
        Simpan Perubahan
      </button>
    </div>
  );
}
