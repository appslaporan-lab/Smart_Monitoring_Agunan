'use client';

import { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

type AgunanDetail = {
  id: number;
  kodeRegister: string;
  jenis: string;
  deskripsi: string;
  status: string;
  nasabah: {
    nama: string;
    alamat: string | null;
    telepon: string | null;
  };
};

export default function FormalBeritaAcaraForm({ agunan }: { agunan: AgunanDetail }) {
  const [form, setForm] = useState({
    nomorDokumen: `BA-ST-${agunan.kodeRegister}-${new Date().getFullYear()}`,
    nomorRegister: agunan.kodeRegister,
    namaNasabah: agunan.nasabah.nama,
    alamat: agunan.nasabah.alamat ?? '',
    nomorRekening: '',
    tanggalLunas: '',
    jenisAgunan: agunan.jenis,
    yangMenyerahkan: '',
    menyetujui: '',
    yangMenerima: '',
  });
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const updateField = (field: string, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setPhotoPreview(null);
      setPhotoDataUrl(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
      setPhotoDataUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const saveDocument = async () => {
    setStatusMessage(null);
    const response = await fetch('/api/berita-acara', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agunanId: agunan.id,
        nomorDokumen: form.nomorDokumen,
        nomorRegister: form.nomorRegister,
        namaNasabah: form.namaNasabah,
        alamat: form.alamat,
        nomorRekening: form.nomorRekening,
        tanggalLunas: form.tanggalLunas,
        jenisAgunan: form.jenisAgunan,
        photoDataUrl,
        yangMenyerahkan: form.yangMenyerahkan,
        menyetujui: form.menyetujui,
        yangMenerima: form.yangMenerima,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      setStatusMessage(result.error || 'Gagal menyimpan berita acara.');
      return;
    }

    setStatusMessage('Berita acara berhasil disimpan ke database.');
  };

  const downloadPDF = async () => {
    const element = document.querySelector('.formal-a4-sheet');
    if (!element) return;

    const canvas = await html2canvas(element as HTMLElement, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const pdfWidth = 210;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${form.nomorDokumen}.pdf`);
  };

  return (
    <div className="formal-print-shell">
      <div className="print-actions">
        <button className="button" type="button" onClick={() => window.print()}>
          Cetak
        </button>
        <button className="button secondary" type="button" onClick={downloadPDF}>
          Unduh PDF
        </button>
        <button className="button" type="button" onClick={saveDocument}>
          Simpan ke Database
        </button>
        <button className="button secondary" type="button" onClick={() => setPreviewMode((current) => !current)}>
          {previewMode ? 'Sembunyikan Preview' : 'Tinjau Sebelum Cetak'}
        </button>
      </div>

      <div className="formal-a4-sheet">
        {statusMessage ? (
          <div className="alert alert-info" style={{ marginBottom: 16 }}>
            {statusMessage}
          </div>
        ) : null}

        <div className="formal-header">
          <img src="/logo-bpr.svg" alt="Logo BPR" className="formal-logo" />
          <div>
            <p className="formal-subtitle">PT BPR BANK TULUNGAGUNG PERSERODA</p>
            <h1 className="formal-title">BERITA ACARA SERAH TERIMA AGUNAN</h1>
            <p className="formal-doc-number">Nomor Dokumen: {form.nomorDokumen}</p>
          </div>
        </div>

        <p className="formal-description">
          Pada hari ini, kami yang bertandatangan di bawah ini telah melakukan serah terima agunan untuk nasabah yang telah melunasi kredit.
        </p>

        <div className="formal-fields">
          <div>
            <label className="label">Nomor Register</label>
            <input className="inputField" value={form.nomorRegister} readOnly />
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
        </div>

        <div className="formal-photo-section">
          <div>
            <label className="label">Foto Penyerahan</label>
            <input className="inputField" type="file" accept="image/*" onChange={handlePhotoChange} />
          </div>
          <div className="formal-photo-preview">
            {photoPreview ? <img src={photoPreview} alt="Foto penyerahan" /> : <p>Belum ada foto penyerahan.</p>}
          </div>
        </div>

        <div className="formal-signature-grid">
          <div>
            <p className="signature-label">Yang Menyerahkan</p>
            <div className="signature-line" />
            <p className="signature-name">{form.yangMenyerahkan || '........................................'}</p>
          </div>
          <div>
            <p className="signature-label">Menyetujui</p>
            <div className="signature-line" />
            <p className="signature-name">{form.menyetujui || '........................................'}</p>
          </div>
          <div>
            <p className="signature-label">Yang Menerima</p>
            <div className="signature-line" />
            <p className="signature-name">{form.yangMenerima || '........................................'}</p>
          </div>
        </div>

        <p className="formal-footer">Dokumen ini dicetak secara resmi untuk keperluan administrasi serah terima agunan.</p>
      </div>

      {previewMode ? (
        <div className="card" style={{ padding: 24, marginTop: 24 }}>
          <h2>Preview Data Final</h2>
          <p><strong>Nomor Dokumen:</strong> {form.nomorDokumen}</p>
          <p><strong>Nomor Register:</strong> {form.nomorRegister}</p>
          <p><strong>Nama Nasabah:</strong> {form.namaNasabah}</p>
          <p><strong>Alamat:</strong> {form.alamat}</p>
          <p><strong>Nomor Rekening:</strong> {form.nomorRekening}</p>
          <p><strong>Tanggal Lunas:</strong> {form.tanggalLunas || '-'}</p>
          <p><strong>Jenis Agunan:</strong> {form.jenisAgunan}</p>
          <p><strong>Yang Menyerahkan:</strong> {form.yangMenyerahkan}</p>
          <p><strong>Menyetujui:</strong> {form.menyetujui}</p>
          <p><strong>Yang Menerima:</strong> {form.yangMenerima}</p>
          <div style={{ marginTop: 18 }}>
            <strong>Foto Penyerahan</strong>
            <div className="formal-photo-preview" style={{ marginTop: 12 }}>
              {photoPreview ? <img src={photoPreview} alt="Preview foto penyerahan" /> : <p>Belum ada foto.</p>}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
