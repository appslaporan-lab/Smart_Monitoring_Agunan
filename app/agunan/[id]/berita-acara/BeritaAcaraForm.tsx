'use client';

import { useMemo, useState } from 'react';

type AgunanDetail = {
  id: number;
  kodeRegister: string;
  jenis: string;
  deskripsi: string | null;
  status: string;
  nasabah: {
    nama: string;
    alamat: string | null;
    telepon: string | null;
  };
};

export default function BeritaAcaraForm({ agunan }: { agunan: AgunanDetail }) {
  const [form, setForm] = useState({
    namaNasabah: agunan.nasabah.nama,
    alamat: agunan.nasabah.alamat ?? '',
    nomorRekening: '',
    tanggalLunas: '',
    jenisAgunan: `${agunan.kodeRegister} - ${agunan.jenis}`,
    yangMenyerahkan: '',
    menyetujui: '',
    yangMenerima: '',
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const updateField = (field: string, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setPhotoPreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const todayLabel = useMemo(() => {
    const today = new Date();
    return today.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  }, []);

  return (
    <div className="print-shell">
      <div className="print-actions">
        <button className="button" type="button" onClick={() => window.print()}>
          Cetak / Simpan PDF
        </button>
      </div>

      <div className="a4-sheet">
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <h1 style={{ marginBottom: 6 }}>BERITA ACARA SERAH TERIMA AGUNAN</h1>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>Untuk agunan yang telah diserahkan kepada nasabah yang telah lunas</p>
        </div>

        <div className="form-grid">
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
            <input className="inputField" value={form.jenisAgunan} onChange={(event) => updateField('jenisAgunan', event.target.value)} />
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

        <div className="photo-box">
          <div>
            <label className="label">Foto Penyerahan</label>
            <input className="inputField" type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} />
          </div>
          <div className="photo-preview">
            {photoPreview ? <img src={photoPreview} alt="Foto penyerahan" /> : <p>Belum ada foto yang dipilih.</p>}
          </div>
        </div>

        <div className="signature-blocks">
          <div>
            <p>Yang Menyerahkan</p>
            <div className="signature-line" />
            <p style={{ marginTop: 8, fontWeight: 600 }}>{form.yangMenyerahkan || '........................................'}</p>
          </div>
          <div>
            <p>Menyetujui</p>
            <div className="signature-line" />
            <p style={{ marginTop: 8, fontWeight: 600 }}>{form.menyetujui || '........................................'}</p>
          </div>
          <div>
            <p>Yang Menerima</p>
            <div className="signature-line" />
            <p style={{ marginTop: 8, fontWeight: 600 }}>{form.yangMenerima || '........................................'}</p>
          </div>
        </div>

        <div style={{ marginTop: 20, fontSize: '0.95rem' }}>
          <p style={{ marginBottom: 4 }}>Demikian berita acara ini dibuat dengan sebenarnya.</p>
          <p>Yang membuat, <strong>{form.yangMenyerahkan || '........................................'}</strong></p>
          <p style={{ marginTop: 10 }}>Tanggal: {form.tanggalLunas ? new Date(form.tanggalLunas).toLocaleDateString('id-ID') : todayLabel}</p>
        </div>
      </div>
    </div>
  );
}
