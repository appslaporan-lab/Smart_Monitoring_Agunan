'use client';

import { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import SignaturePad from '@/components/SignaturePad';

type AgunanRow = {
  jenis: string;
  identitas: string;
  namaPemilik: string;
};

export default function ManualBeritaAcaraForm() {
  const [form, setForm] = useState({
    nomorDokumen: `BA-ST-MANUAL-${Date.now().toString().slice(-6)}`,
    namaNasabah: '',
    alamat: '',
    nomorRekening: '',
    tanggalLunas: '',
    tanggalSerahTerima: new Date().toISOString().split('T')[0],
    ttdAdmKredit: '',
    ttdYangMenyerahkan: '',
    ttdYangMenerima: '',
    ttdMengetahui: '',
  });

  const [daftarAgunan, setDaftarAgunan] = useState<AgunanRow[]>([
    { jenis: '', identitas: '', namaPemilik: '' },
  ]);

  const [sigAdmKredit, setSigAdmKredit] = useState<string | null>(null);
  const [sigMenyerahkan, setSigMenyerahkan] = useState<string | null>(null);
  const [sigMenerima, setSigMenerima] = useState<string | null>(null);
  const [sigMengetahui, setSigMengetahui] = useState<string | null>(null);

  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const updateField = (field: string, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateAgunanRow = (index: number, field: keyof AgunanRow, value: string) => {
    setDaftarAgunan((current) => current.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const addRow = () => setDaftarAgunan((current) => [...current, { jenis: '', identitas: '', namaPemilik: '' }]);
  const removeRow = (index: number) => setDaftarAgunan((current) => current.filter((_, i) => i !== index));

  const resizeImage = (dataUrl: string, maxDimension: number, quality: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = dataUrl;
    });
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setPhotoPreview(null);
      setPhotoDataUrl(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const original = reader.result as string;
      const resized = await resizeImage(original, 1200, 0.82);
      setPhotoPreview(resized);
      setPhotoDataUrl(resized);
    };
    reader.readAsDataURL(file);
  };

  const generatePdfDataUrl = async (): Promise<string | null> => {
    const element = document.querySelector('.ba-manual-a4') as HTMLElement;
    if (!element) return null;

    const canvas = await html2canvas(element, {
      scale: 2.5,
      useCORS: true,
      logging: false,
      width: element.offsetWidth,
      height: element.offsetHeight,
      windowWidth: element.offsetWidth,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

    const pageWidth = 210;
    const pageHeight = 297;
    const imgAspect = canvas.height / canvas.width;
    const imgHeight = pageWidth * imgAspect;

    if (imgHeight <= pageHeight) {
      // Muat 1 halaman — skala agar pas
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, imgHeight);
    } else {
      // Jika melebihi 1 halaman, skala paksa ke 1 halaman
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
    }

    return pdf.output('datauristring');
  };

  const saveDocument = async () => {
    setIsSaving(true);
    setStatusMessage('Menyiapkan PDF...');

    let pdfDataUrl: string | null = null;
    try {
      pdfDataUrl = await generatePdfDataUrl();
    } catch (err: any) {
      console.error('Gagal generate PDF:', err);
      setStatusMessage(`Gagal PDF: ${err?.message || 'error'}. Menyimpan tanpa PDF...`);
    }

    try {
      const response = await fetch('/api/berita-acara/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomorDokumen: form.nomorDokumen,
          namaNasabah: form.namaNasabah.toUpperCase(),
          alamat: form.alamat.toUpperCase(),
          nomorRekening: form.nomorRekening,
          tanggalLunas: form.tanggalLunas,
          daftarAgunan: daftarAgunan.map((row) => ({
            jenis: row.jenis.toUpperCase(),
            identitas: row.identitas.toUpperCase(),
            namaPemilik: row.namaPemilik.toUpperCase(),
          })),
          photoDataUrl,
          ttdAdmKredit: form.ttdAdmKredit.toUpperCase(),
          ttdYangMenyerahkan: form.ttdYangMenyerahkan.toUpperCase(),
          ttdYangMenerima: form.ttdYangMenerima.toUpperCase(),
          ttdMengetahui: form.ttdMengetahui.toUpperCase(),
          ttdAdmKreditImg: sigAdmKredit,
          ttdYangMenyerahkanImg: sigMenyerahkan,
          ttdYangMenerimaImg: sigMenerima,
          ttdMengetahuiImg: sigMengetahui,
          pdfDataUrl,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        setStatusMessage(result.error || 'Gagal menyimpan berita acara.');
      } else {
        setStatusMessage(pdfDataUrl ? '✅ Berita acara & PDF berhasil disimpan.' : '✅ Berita acara disimpan (tanpa PDF).');
      }
    } catch (err: any) {
      setStatusMessage(`Gagal menghubungi server: ${err?.message || 'error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const downloadPDF = async () => {
    try {
      setStatusMessage('Menyiapkan PDF...');
      const dataUrl = await generatePdfDataUrl();
      if (!dataUrl) {
        setStatusMessage('Gagal: elemen dokumen tidak ditemukan.');
        return;
      }
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${form.nomorDokumen}.pdf`;
      link.click();
      setStatusMessage(null);
    } catch (err: any) {
      setStatusMessage(`Gagal membuat PDF: ${err?.message || 'error'}`);
    }
  };

  const formatTanggalIndo = (dateStr: string) => {
    if (!dateStr) return '___________________';
    const bulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    const d = new Date(dateStr);
    return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
  };

  const signatureRows = [
    { key: 'adm', label: 'Adm Kredit', name: form.ttdAdmKredit, img: sigAdmKredit, setImg: setSigAdmKredit, field: 'ttdAdmKredit', placeholder: 'Nama Adm Kredit' },
    { key: 'serah', label: 'Yang Menyerahkan', name: form.ttdYangMenyerahkan, img: sigMenyerahkan, setImg: setSigMenyerahkan, field: 'ttdYangMenyerahkan', placeholder: 'Nama Yang Menyerahkan' },
    { key: 'terima', label: 'Yang Menerima', name: form.ttdYangMenerima, img: sigMenerima, setImg: setSigMenerima, field: 'ttdYangMenerima', placeholder: 'Nama Yang Menerima' },
    { key: 'tahu', label: 'Mengetahui', name: form.ttdMengetahui, img: sigMengetahui, setImg: setSigMengetahui, field: 'ttdMengetahui', placeholder: 'Nama Mengetahui' },
  ];

  return (
    <div className="ba-manual-shell">
      {/* ── Toolbar (tidak ikut cetak) ── */}
      <div className="no-print ba-toolbar">
        <button className="button" type="button" onClick={() => window.print()}>🖨 Cetak</button>
        <button className="button secondary" type="button" onClick={downloadPDF}>⬇ Unduh PDF</button>
        <button className="button" type="button" onClick={saveDocument} disabled={isSaving}>
          {isSaving ? 'Menyimpan...' : '💾 Simpan ke Database'}
        </button>
      </div>

      {statusMessage && (
        <div className="no-print ba-status-msg">{statusMessage}</div>
      )}

      {/* ── Form Input (tidak ikut cetak) ── */}
      <div className="no-print card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 className="ba-section-title">Data Berita Acara</h3>

        <div className="ba-form-grid">
          <div>
            <label className="label">Nomor Rekening</label>
            <input className="inputField" value={form.nomorRekening} onChange={(e) => updateField('nomorRekening', e.target.value)} placeholder="Kosongkan jika belum ada" />
          </div>
          <div>
            <label className="label">Tanggal Lunas</label>
            <input className="inputField" type="date" value={form.tanggalLunas} onChange={(e) => updateField('tanggalLunas', e.target.value)} />
          </div>
          <div>
            <label className="label">Tanggal Serah Terima</label>
            <input className="inputField" type="date" value={form.tanggalSerahTerima} onChange={(e) => updateField('tanggalSerahTerima', e.target.value)} />
          </div>
          <div>
            <label className="label">Nama Peminjam</label>
            <input className="inputField" value={form.namaNasabah} onChange={(e) => updateField('namaNasabah', e.target.value)} required />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="label">Alamat</label>
            <input className="inputField" value={form.alamat} onChange={(e) => updateField('alamat', e.target.value)} />
          </div>
        </div>

        <div className="ba-subsection">
          <p className="ba-subsection-label">Daftar Agunan (Isi Manual)</p>
          {daftarAgunan.map((row, idx) => (
            <div key={idx} className="ba-agunan-row">
              <input className="inputField" placeholder="Jenis Agunan" value={row.jenis} onChange={(e) => updateAgunanRow(idx, 'jenis', e.target.value)} />
              <input className="inputField" placeholder="No. BPKB / SHM / Plat" value={row.identitas} onChange={(e) => updateAgunanRow(idx, 'identitas', e.target.value)} />
              <input className="inputField" placeholder="Nama Pemilik" value={row.namaPemilik} onChange={(e) => updateAgunanRow(idx, 'namaPemilik', e.target.value)} />
              {daftarAgunan.length > 1 && (
                <button type="button" className="button danger" style={{ padding: '8px 12px', whiteSpace: 'nowrap' }} onClick={() => removeRow(idx)}>Hapus</button>
              )}
            </div>
          ))}
          <button type="button" className="button secondary" onClick={addRow} style={{ marginTop: 8 }}>+ Tambah Baris</button>
        </div>

        <div className="ba-subsection">
          <p className="ba-subsection-label">Tanda Tangan Digital</p>
          <div className="ba-sig-input-grid">
            {signatureRows.map((ttd) => (
              <div key={ttd.key}>
                <input className="inputField" style={{ marginBottom: 8 }} placeholder={ttd.placeholder} value={ttd.name} onChange={(e) => updateField(ttd.field, e.target.value)} />
                <SignaturePad label={`TTD ${ttd.label}`} onChange={ttd.setImg} />
              </div>
            ))}
          </div>
        </div>

        <div className="ba-subsection">
          <label className="label">Foto Dokumentasi Penyerahan</label>
          <input className="inputField" type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} style={{ marginBottom: 8 }} />
          {photoPreview && (
            <div style={{ marginTop: 8 }}>
              <img src={photoPreview} alt="Preview foto" style={{ maxHeight: 200, maxWidth: '100%', objectFit: 'contain', border: '1px dashed #cbd5e1', borderRadius: 8 }} />
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          DOKUMEN A4 — Hanya bagian ini yang dicetak
          ══════════════════════════════════════════════ */}
      <div className="ba-manual-a4">

        {/* Header */}
        <div className="ba-doc-header">
          <img src="/logo-bpr-resmi.png" alt="Logo PT BPR Bank Tulungagung" crossOrigin="anonymous" className="ba-doc-logo" />
          <div className="ba-doc-instansi">
            <p className="ba-inst-nama">PT BPR BANK TULUNGAGUNG PERSERODA</p>
            <p className="ba-inst-sub">Jl. Pahlawan No. 1 Tulungagung — Telp. (0355) XXXXXXX</p>
          </div>
          <div className="ba-doc-nomor">
            <span className="ba-label-kecil">No. Dokumen</span>
            <strong>{form.nomorDokumen}</strong>
          </div>
        </div>

        <div className="ba-doc-divider" />

        {/* Judul */}
        <div className="ba-doc-judul">
          <h1>BERITA ACARA SERAH TERIMA AGUNAN</h1>
          <div className="ba-judul-underline" />
        </div>

        {/* Pembuka */}
        <p className="ba-doc-pembuka">
          Pada hari ini, <strong>{formatTanggalIndo(form.tanggalSerahTerima)}</strong>, kami yang bertanda tangan
          di bawah ini telah melakukan serah terima agunan kepada nasabah yang bersangkutan dengan rincian sebagai berikut:
        </p>

        {/* Info Nasabah + Foto berdampingan */}
        <div className="ba-info-foto-row">
          {/* Tabel info nasabah */}
          <div className="ba-info-box">
            <table className="ba-info-table">
              <tbody>
                <tr>
                  <td className="ba-td-label">Nomor Rekening</td>
                  <td className="ba-td-sep">:</td>
                  <td className="ba-td-val"><strong>{form.nomorRekening || '___________________________'}</strong></td>
                </tr>
                <tr>
                  <td className="ba-td-label">Nama Peminjam</td>
                  <td className="ba-td-sep">:</td>
                  <td className="ba-td-val"><strong>{form.namaNasabah || '-'}</strong></td>
                </tr>
                <tr>
                  <td className="ba-td-label">Alamat</td>
                  <td className="ba-td-sep">:</td>
                  <td className="ba-td-val">{form.alamat || '-'}</td>
                </tr>
                <tr>
                  <td className="ba-td-label">Tanggal Lunas</td>
                  <td className="ba-td-sep">:</td>
                  <td className="ba-td-val">{form.tanggalLunas ? formatTanggalIndo(form.tanggalLunas) : '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Foto dokumentasi — luas */}
          {photoPreview ? (
            <div className="ba-foto-box">
              <p className="ba-foto-caption">Foto Dokumentasi</p>
              <img src={photoPreview} alt="Foto penyerahan" className="ba-foto-img" />
            </div>
          ) : (
            <div className="ba-foto-box ba-foto-empty">
              <span>Foto Dokumentasi</span>
            </div>
          )}
        </div>

        {/* Tabel Daftar Agunan */}
        <div className="ba-agunan-section">
          <h3 className="ba-section-heading">Daftar Agunan yang Diserahkan</h3>
          <table className="ba-agunan-table">
            <thead>
              <tr>
                <th style={{ width: '5%' }}>No</th>
                <th style={{ width: '25%' }}>Jenis Agunan</th>
                <th style={{ width: '40%' }}>Identitas (No. BPKB / SHM / Plat)</th>
                <th>Nama Pemilik Agunan</th>
              </tr>
            </thead>
            <tbody>
              {daftarAgunan.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                  <td>{row.jenis || '-'}</td>
                  <td>{row.identitas || '-'}</td>
                  <td>{row.namaPemilik || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tanda Tangan */}
        <div className="ba-ttd-section">
          <p className="ba-ttd-kota">Tulungagung, {formatTanggalIndo(form.tanggalSerahTerima)}</p>
          <div className="ba-ttd-grid">
            {signatureRows.map((ttd) => (
              <div key={ttd.key} className="ba-ttd-block">
                <p className="ba-ttd-role">{ttd.label}</p>
                <div className="ba-ttd-canvas">
                  {ttd.img && <img src={ttd.img} alt={`TTD ${ttd.label}`} className="ba-ttd-img" />}
                </div>
                <p className="ba-ttd-name">{ttd.name || '............................'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="ba-doc-footer">
          Dokumen ini dicetak secara resmi untuk keperluan administrasi serah terima agunan — PT BPR Bank Tulungagung Perseroda
        </p>
      </div>
    </div>
  );
}