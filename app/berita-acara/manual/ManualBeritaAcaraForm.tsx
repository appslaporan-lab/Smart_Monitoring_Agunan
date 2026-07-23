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

  const updateField = (field: string, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateAgunanRow = (index: number, field: keyof AgunanRow, value: string) => {
    setDaftarAgunan((current) => current.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const addRow = () => setDaftarAgunan((current) => [...current, { jenis: '', identitas: '', namaPemilik: '' }]);
  const removeRow = (index: number) => setDaftarAgunan((current) => current.filter((_, i) => i !== index));

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
    const response = await fetch('/api/berita-acara/manual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nomorDokumen: form.nomorDokumen,
        namaNasabah: form.namaNasabah,
        alamat: form.alamat,
        nomorRekening: form.nomorRekening,
        tanggalLunas: form.tanggalLunas,
        daftarAgunan,
        photoDataUrl,
        ttdAdmKredit: form.ttdAdmKredit,
        ttdYangMenyerahkan: form.ttdYangMenyerahkan,
        ttdYangMenerima: form.ttdYangMenerima,
        ttdMengetahui: form.ttdMengetahui,
        ttdAdmKreditImg: sigAdmKredit,
        ttdYangMenyerahkanImg: sigMenyerahkan,
        ttdYangMenerimaImg: sigMenerima,
        ttdMengetahuiImg: sigMengetahui,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      setStatusMessage(result.error || 'Gagal menyimpan berita acara.');
      return;
    }
    setStatusMessage('Berita acara manual berhasil disimpan ke database.');
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

  const formatTanggalIndo = (dateStr: string) => {
    if (!dateStr) return '____________';
    const bulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    const d = new Date(dateStr);
    return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
  };

  const signatureRows = [
    { label: 'Adm Kredit', name: form.ttdAdmKredit, img: sigAdmKredit },
    { label: 'Yang Menyerahkan', name: form.ttdYangMenyerahkan, img: sigMenyerahkan },
    { label: 'Yang Menerima', name: form.ttdYangMenerima, img: sigMenerima },
    { label: 'Mengetahui', name: form.ttdMengetahui, img: sigMengetahui },
  ];

  return (
    <div className="formal-print-shell">
      <div className="no-print" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
        <button className="button" type="button" onClick={() => window.print()}>Cetak</button>
        <button className="button secondary" type="button" onClick={downloadPDF}>Unduh PDF</button>
        <button className="button" type="button" onClick={saveDocument}>Simpan ke Database</button>
      </div>

      {statusMessage && (
        <div className="no-print alert alert-info" style={{ marginBottom: 12 }}>{statusMessage}</div>
      )}

      <div className="no-print card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: '#334155' }}>Data untuk Berita Acara</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
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

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16, marginTop: 4 }}>
          <p style={{ margin: '0 0 12px', fontWeight: 600, color: '#334155', fontSize: '0.95rem' }}>Daftar Agunan (Isi Manual)</p>
          {daftarAgunan.map((row, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 10, marginBottom: 8, alignItems: 'center' }}>
              <input className="inputField" placeholder="Jenis Agunan" value={row.jenis} onChange={(e) => updateAgunanRow(idx, 'jenis', e.target.value)} />
              <input className="inputField" placeholder="No. BPKB/SHM/Plat" value={row.identitas} onChange={(e) => updateAgunanRow(idx, 'identitas', e.target.value)} />
              <input className="inputField" placeholder="Nama Pemilik" value={row.namaPemilik} onChange={(e) => updateAgunanRow(idx, 'namaPemilik', e.target.value)} />
              {daftarAgunan.length > 1 && (
                <button type="button" className="button danger" style={{ padding: '8px 12px' }} onClick={() => removeRow(idx)}>Hapus</button>
              )}
            </div>
          ))}
          <button type="button" className="button secondary" onClick={addRow} style={{ marginTop: 8 }}>+ Tambah Baris Agunan</button>
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16, marginTop: 16 }}>
          <p style={{ margin: '0 0 12px', fontWeight: 600, color: '#334155', fontSize: '0.95rem' }}>Tanda Tangan Digital</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <input className="inputField" style={{ marginBottom: 8 }} placeholder="Nama Adm Kredit" value={form.ttdAdmKredit} onChange={(e) => updateField('ttdAdmKredit', e.target.value)} />
              <SignaturePad label="Tanda Tangan Adm Kredit" onChange={setSigAdmKredit} />
            </div>
            <div>
              <input className="inputField" style={{ marginBottom: 8 }} placeholder="Nama Yang Menyerahkan" value={form.ttdYangMenyerahkan} onChange={(e) => updateField('ttdYangMenyerahkan', e.target.value)} />
              <SignaturePad label="Tanda Tangan Yang Menyerahkan" onChange={setSigMenyerahkan} />
            </div>
            <div>
              <input className="inputField" style={{ marginBottom: 8 }} placeholder="Nama Yang Menerima" value={form.ttdYangMenerima} onChange={(e) => updateField('ttdYangMenerima', e.target.value)} />
              <SignaturePad label="Tanda Tangan Yang Menerima" onChange={setSigMenerima} />
            </div>
            <div>
              <input className="inputField" style={{ marginBottom: 8 }} placeholder="Nama Mengetahui" value={form.ttdMengetahui} onChange={(e) => updateField('ttdMengetahui', e.target.value)} />
              <SignaturePad label="Tanda Tangan Mengetahui" onChange={setSigMengetahui} />
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16, marginTop: 16 }}>
          <label className="label">Foto Penyerahan</label>
          <input className="inputField" type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} style={{ marginBottom: 8 }} />
          {photoPreview && (
            <div style={{ marginTop: 8 }}>
              <img src={photoPreview} alt="Foto penyerahan" style={{ maxHeight: 160, objectFit: 'contain', border: '1px dashed #cbd5e1' }} />
            </div>
          )}
        </div>
      </div>

      <div className="formal-a4-sheet">
        <div className="formal-header" style={{ borderBottom: '3px solid #1e3a8a', paddingBottom: 16, marginBottom: 20 }}>
          <img
            src="/logo-bpr-resmi.png"
            alt="Logo PT BPR Bank Tulungagung"
            style={{ height: 70, width: 'auto', objectFit: 'contain' }}
          />
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569' }}>No. Dokumen:</p>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{form.nomorDokumen}</p>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#0f172a' }}>
            BERITA ACARA SERAH TERIMA AGUNAN
          </h1>
          <div style={{ width: 60, height: 3, background: '#1e3a8a', margin: '8px auto 0' }} />
        </div>

        <p style={{ margin: '0 0 18px', lineHeight: 1.8, color: '#334155', textAlign: 'justify' }}>
          Pada hari ini, <strong>{formatTanggalIndo(form.tanggalSerahTerima)}</strong>, kami yang bertanda tangan di bawah ini
          telah melakukan serah terima agunan kepada nasabah yang bersangkutan, dengan rincian sebagai berikut:
        </p>

        <div style={{ border: '1px solid #cbd5e1', borderRadius: 8, padding: 16, marginBottom: 20, background: '#f8fafc' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem' }}>
            <tbody>
              <tr>
                <td style={{ width: '35%', padding: '5px 0', color: '#475569', fontWeight: 600 }}>Nomor Rekening</td>
                <td style={{ width: '5%' }}>:</td>
                <td style={{ fontWeight: 700 }}>{form.nomorRekening || '__________________________'}</td>
              </tr>
              <tr>
                <td style={{ padding: '5px 0', color: '#475569', fontWeight: 600 }}>Nama Peminjam</td>
                <td>:</td>
                <td style={{ fontWeight: 700 }}>{form.namaNasabah || '-'}</td>
              </tr>
              <tr>
                <td style={{ padding: '5px 0', color: '#475569', fontWeight: 600 }}>Alamat</td>
                <td>:</td>
                <td>{form.alamat || '-'}</td>
              </tr>
              <tr>
                <td style={{ padding: '5px 0', color: '#475569', fontWeight: 600 }}>Tanggal Lunas</td>
                <td>:</td>
                <td>{form.tanggalLunas ? formatTanggalIndo(form.tanggalLunas) : '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 10px', borderLeft: '3px solid #1e3a8a', paddingLeft: 10, color: '#0f172a' }}>
            Daftar Agunan yang Diserahkan
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#1e3a8a', color: 'white' }}>
                <th style={{ padding: '8px 10px', textAlign: 'center', width: '5%' }}>No</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', width: '25%' }}>Jenis Agunan</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', width: '35%' }}>Identitas (No. BPKB / SHM / Plat)</th>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Nama Pemilik Agunan</th>
              </tr>
            </thead>
            <tbody>
              {daftarAgunan.map((row, idx) => (
                <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>{idx + 1}</td>
                  <td style={{ padding: '8px 10px' }}>{row.jenis || '-'}</td>
                  <td style={{ padding: '8px 10px' }}>{row.identitas || '-'}</td>
                  <td style={{ padding: '8px 10px' }}>{row.namaPemilik || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {photoPreview && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 10px', borderLeft: '3px solid #1e3a8a', paddingLeft: 10, color: '#0f172a' }}>
              Dokumentasi Penyerahan
            </h3>
            <div style={{ textAlign: 'center' }}>
              <img src={photoPreview} alt="Foto penyerahan" style={{ maxHeight: 200, maxWidth: '100%', objectFit: 'contain', border: '1px solid #e2e8f0' }} />
            </div>
          </div>
        )}

        <div style={{ marginTop: 32 }}>
          <p style={{ textAlign: 'right', marginBottom: 40, color: '#334155', fontSize: '0.9rem' }}>
            Tulungagung, {formatTanggalIndo(form.tanggalSerahTerima)}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, textAlign: 'center' }}>
            {signatureRows.map((ttd) => (
              <div key={ttd.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '0.88rem', color: '#475569' }}>{ttd.label}</p>
                <div style={{ height: 64, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  {ttd.img ? (
                    <img src={ttd.img} alt={`Tanda tangan ${ttd.label}`} style={{ maxHeight: 60, maxWidth: '100%', objectFit: 'contain' }} />
                  ) : null}
                </div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', borderTop: '1px solid #0f172a', paddingTop: 4, width: '100%' }}>
                  {ttd.name || '............................'}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p style={{ marginTop: 32, fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
          Dokumen ini dicetak secara resmi untuk keperluan administrasi serah terima agunan — PT BPR Bank Tulungagung Perseroda
        </p>
      </div>
    </div>
  );
}