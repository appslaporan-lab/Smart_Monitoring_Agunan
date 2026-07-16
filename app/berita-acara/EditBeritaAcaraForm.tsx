'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

type BeritaAcaraEdit = {
  id: number;
  nomorDokumen: string;
  nomorRegister: string;
  namaNasabah: string;
  alamat: string | null;
  nomorRekening: string | null;
  tanggalLunas: Date | null;
  jenisAgunan: string;
  photoDataUrl: string | null;
  ttdAdmKredit: string | null;
  ttdYangMenyerahkan: string | null;
  ttdYangMenerima: string | null;
  ttdMengetahui: string | null;
};

export default function EditBeritaAcaraForm({ beritaAcara }: { beritaAcara: BeritaAcaraEdit }) {
  const router = useRouter();

  const [form, setForm] = useState({
    nomorDokumen: beritaAcara.nomorDokumen,
    namaNasabah: beritaAcara.namaNasabah,
    alamat: beritaAcara.alamat || '',
    nomorRekening: beritaAcara.nomorRekening || '',
    tanggalLunas: beritaAcara.tanggalLunas ? new Date(beritaAcara.tanggalLunas).toISOString().split('T')[0] : '',
    jenisAgunan: beritaAcara.jenisAgunan,
    ttdAdmKredit: beritaAcara.ttdAdmKredit || '',
    ttdYangMenyerahkan: beritaAcara.ttdYangMenyerahkan || '',
    ttdYangMenerima: beritaAcara.ttdYangMenerima || '',
    ttdMengetahui: beritaAcara.ttdMengetahui || '',
  });

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateField = (field: string, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);

    const response = await fetch(`/api/berita-acara/${beritaAcara.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const result = await response.json();

    if (!response.ok) {
      setErrorMessage(result.error || 'Gagal memperbarui berita acara.');
      return;
    }

    setStatusMessage('Berita acara berhasil diperbarui.');
    setTimeout(() => {
      router.push('/berita-acara');
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="grid" style={{ gap: 20 }}>
      {statusMessage && <div className="alert alert-info">{statusMessage}</div>}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label className="label">Nomor Dokumen</label>
          <input className="inputField" value={form.nomorDokumen} onChange={(e) => updateField('nomorDokumen', e.target.value)} required />
        </div>
        <div>
          <label className="label">Nomor Register</label>
          <input className="inputField" value={beritaAcara.nomorRegister} disabled />
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label className="label">Nama Nasabah</label>
          <input className="inputField" value={form.namaNasabah} onChange={(e) => updateField('namaNasabah', e.target.value)} required />
        </div>
        <div>
          <label className="label">Nomor Rekening</label>
          <input className="inputField" value={form.nomorRekening} onChange={(e) => updateField('nomorRekening', e.target.value)} />
        </div>
      </div>

      <div>
        <label className="label">Alamat</label>
        <input className="inputField" value={form.alamat} onChange={(e) => updateField('alamat', e.target.value)} />
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label className="label">Tanggal Lunas</label>
          <input className="inputField" type="date" value={form.tanggalLunas} onChange={(e) => updateField('tanggalLunas', e.target.value)} />
        </div>
        <div>
          <label className="label">Jenis Agunan</label>
          <input className="inputField" value={form.jenisAgunan} onChange={(e) => updateField('jenisAgunan', e.target.value)} />
        </div>
      </div>

      <h3 style={{ margin: '16px 0 0' }}>Tanda Tangan</h3>
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label className="label">Adm Kredit</label>
          <input className="inputField" value={form.ttdAdmKredit} onChange={(e) => updateField('ttdAdmKredit', e.target.value)} />
        </div>
        <div>
          <label className="label">Yang Menyerahkan</label>
          <input className="inputField" value={form.ttdYangMenyerahkan} onChange={(e) => updateField('ttdYangMenyerahkan', e.target.value)} />
        </div>
      </div>
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label className="label">Yang Menerima</label>
          <input className="inputField" value={form.ttdYangMenerima} onChange={(e) => updateField('ttdYangMenerima', e.target.value)} />
        </div>
        <div>
          <label className="label">Mengetahui</label>
          <input className="inputField" value={form.ttdMengetahui} onChange={(e) => updateField('ttdMengetahui', e.target.value)} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
        <button type="button" className="button secondary" onClick={() => router.back()}>Batal</button>
        <button type="submit" className="button">Simpan Perubahan</button>
      </div>
    </form>
  );
}
