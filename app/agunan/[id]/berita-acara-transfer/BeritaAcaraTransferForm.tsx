'use client';

import { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import SignaturePad from '@/components/SignaturePad';

type AgunanDetail = {
  id: number;
  kodeRegister: string;
  jenis: string;
  nasabah: { nama: string };
  registrasi: { nomorRekening: string | null };
};

export default function BeritaAcaraTransferForm({ agunan }: { agunan: AgunanDetail }) {
  const [form, setForm] = useState({
    nomorDokumen: `BA-TR-${agunan.kodeRegister}-${new Date().getFullYear()}`,
    namaNasabah: agunan.nasabah.nama,
    nomorRekening: agunan.registrasi?.nomorRekening ?? '',
    tanggalLunas: '',
    tanggalSerah: new Date().toISOString().split('T')[0],
    cabangAsal: '',
    cabangTujuan: '',
    namaPihakPertama: '',
    jabatanPihakPertama: 'ADM Kredit',
    namaPihakKedua: '',
    jabatanPihakKedua: 'Pimpinan Cabang Tujuan',
    namaMengetahui: '',
    jabatanMengetahui: 'Kabag Operasional',
  });
  const [sigPertama, setSigPertama] = useState<string | null>(null);
  const [sigKedua, setSigKedua] = useState<string | null>(null);
  const [sigMengetahui, setSigMengetahui] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const updateField = (field: string, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const formatTanggalIndo = (dateStr: string) => {
    if (!dateStr) return '____________';
    const bulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    const d = new Date(dateStr);
    return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
  };

  const saveDocument = async () => {
    setStatusMessage(null);
    const response = await fetch('/api/berita-acara-transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agunanId: agunan.id,
        nomorDokumen: form.nomorDokumen,
        nomorRegister: agunan.kodeRegister,
        namaNasabah: form.namaNasabah,
        nomorRekening: form.nomorRekening,
        tanggalLunas: form.tanggalLunas,
        cabangAsal: form.cabangAsal,
        cabangTujuan: form.cabangTujuan,
        namaPihakPertama: form.namaPihakPertama,
        jabatanPihakPertama: form.jabatanPihakPertama,
        ttdPihakPertamaImg: sigPertama,
        namaPihakKedua: form.namaPihakKedua,
        jabatanPihakKedua: form.jabatanPihakKedua,
        ttdPihakKeduaImg: sigKedua,
        namaMengetahui: form.namaMengetahui,
        jabatanMengetahui: form.jabatanMengetahui,
        ttdMengetahuiImg: sigMengetahui,
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      setStatusMessage(result.error || 'Gagal menyimpan.');
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

    const pageWidth = 210;
    const pageHeight = 297;
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${form.nomorDokumen}.pdf`);
  };

  return (
    <div className="formal-print-shell">
      <div className="no-print" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
        <button className="button" type="button" onClick={() => window.print()}>Cetak</button>
        <button className="button secondary" type="button" onClick={downloadPDF}>Unduh PDF</button>
        <button className="button" type="button" onClick={saveDocument}>Simpan ke Database</button>
      </div>

      {statusMessage && <div className="no-print alert alert-info" style={{ marginBottom: 12 }}>{statusMessage}</div>}

      <div className="no-print card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: '#334155' }}>Data Berita Acara</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div>
            <label className="label">Nomor Rekening</label>
            <input className="inputField" value={form.nomorRekening} onChange={(e) => updateField('nomorRekening', e.target.value)} />
          </div>
          <div>
            <label className="label">Tanggal Lunas</label>
            <input className="inputField" type="date" value={form.tanggalLunas} onChange={(e) => updateField('tanggalLunas', e.target.value)} />
          </div>
          <div>
            <label className="label">Cabang Asal</label>
            <input className="inputField" value={form.cabangAsal} onChange={(e) => updateField('cabangAsal', e.target.value)} />
          </div>
          <div>
            <label className="label">Cabang Tujuan</label>
            <input className="inputField" value={form.cabangTujuan} onChange={(e) => updateField('cabangTujuan', e.target.value)} />
          </div>
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
          <div>
            <input className="inputField" style={{ marginBottom: 6 }} placeholder="Nama Pihak Pertama" value={form.namaPihakPertama} onChange={(e) => updateField('namaPihakPertama', e.target.value)} />
            <input className="inputField" style={{ marginBottom: 8 }} placeholder="Jabatan" value={form.jabatanPihakPertama} onChange={(e) => updateField('jabatanPihakPertama', e.target.value)} />
            <SignaturePad label="TTD Pihak Pertama (Menyerahkan)" onChange={setSigPertama} />
          </div>
          <div>
            <input className="inputField" style={{ marginBottom: 6 }} placeholder="Nama Pihak Kedua" value={form.namaPihakKedua} onChange={(e) => updateField('namaPihakKedua', e.target.value)} />
            <input className="inputField" style={{ marginBottom: 8 }} placeholder="Jabatan" value={form.jabatanPihakKedua} onChange={(e) => updateField('jabatanPihakKedua', e.target.value)} />
            <SignaturePad label="TTD Pihak Kedua (Menerima)" onChange={setSigKedua} />
          </div>
          <div>
            <input className="inputField" style={{ marginBottom: 6 }} placeholder="Nama Mengetahui" value={form.namaMengetahui} onChange={(e) => updateField('namaMengetahui', e.target.value)} />
            <input className="inputField" style={{ marginBottom: 8 }} placeholder="Jabatan" value={form.jabatanMengetahui} onChange={(e) => updateField('jabatanMengetahui', e.target.value)} />
            <SignaturePad label="TTD Mengetahui" onChange={setSigMengetahui} />
          </div>
        </div>
      </div>

      <div className="formal-a4-sheet">
        <div className="formal-header" style={{ borderBottom: '3px solid #1e3a8a', paddingBottom: 12, marginBottom: 16 }}>
          <img
            src="/logo-bpr-resmi.png"
            alt="Logo PT BPR Bank Tulungagung"
            style={{ height: 60, width: 'auto', objectFit: 'contain' }}
          />
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#475569' }}>No. Dokumen:</p>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem' }}>{form.nomorDokumen}</p>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase' }}>
            Berita Acara Serah Terima Agunan Lunas (Transfer Antar Cabang)
          </h1>
        </div>

        <p style={{ margin: '0 0 14px', fontSize: '0.85rem', lineHeight: 1.6, textAlign: 'justify' }}>
          Pada hari ini, <strong>{formatTanggalIndo(form.tanggalSerah)}</strong>, sehubungan pelunasan fasilitas kredit,
          telah dilakukan serah terima agunan antar Cabang untuk selanjutnya diserahkan kepada nasabah, oleh dan antara pihak-pihak berikut:
        </p>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', marginBottom: 16 }}>
          <tbody>
            <tr>
              <td style={{ padding: '4px 8px', background: '#f1f5f9', fontWeight: 600, width: '20%' }}>No. Register</td>
              <td style={{ padding: '4px 8px', border: '1px solid #e2e8f0' }}>{agunan.kodeRegister}</td>
              <td style={{ padding: '4px 8px', background: '#f1f5f9', fontWeight: 600, width: '20%' }}>Tanggal Lunas</td>
              <td style={{ padding: '4px 8px', border: '1px solid #e2e8f0' }}>{form.tanggalLunas ? formatTanggalIndo(form.tanggalLunas) : '-'}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 8px', background: '#f1f5f9', fontWeight: 600 }}>Nama Nasabah</td>
              <td style={{ padding: '4px 8px', border: '1px solid #e2e8f0' }}>{form.namaNasabah}</td>
              <td style={{ padding: '4px 8px', background: '#f1f5f9', fontWeight: 600 }}>No. Rekening</td>
              <td style={{ padding: '4px 8px', border: '1px solid #e2e8f0' }}>{form.nomorRekening || '-'}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 8px', background: '#f1f5f9', fontWeight: 600 }}>Cabang Asal</td>
              <td style={{ padding: '4px 8px', border: '1px solid #e2e8f0' }}>{form.cabangAsal || '-'}</td>
              <td style={{ padding: '4px 8px', background: '#f1f5f9', fontWeight: 600 }}>Cabang Tujuan</td>
              <td style={{ padding: '4px 8px', border: '1px solid #e2e8f0' }}>{form.cabangTujuan || '-'}</td>
            </tr>
          </tbody>
        </table>

        <p style={{ margin: '0 0 20px', fontSize: '0.85rem', textAlign: 'justify' }}>
          Sejak ditandatanganinya berita acara ini, tanggung jawab penyimpanan dan penyerahan agunan kepada nasabah
          beralih dari Pihak Pertama kepada Pihak Kedua (Cabang Tujuan).
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {[
            { label: 'PIHAK PERTAMA, Yang Menyerahkan', nama: form.namaPihakPertama, jabatan: form.jabatanPihakPertama, img: sigPertama },
            { label: 'PIHAK KEDUA, Yang Menerima', nama: form.namaPihakKedua, jabatan: form.jabatanPihakKedua, img: sigKedua },
          ].map((p) => (
            <div key={p.label} style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '0.82rem' }}>{p.label}</p>
              <div style={{ height: 60, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                {p.img && <img src={p.img} alt="ttd" style={{ maxHeight: 56, maxWidth: '100%', objectFit: 'contain' }} />}
              </div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', borderTop: '1px solid #0f172a', paddingTop: 4 }}>
                {p.nama || '.....................'}
              </p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{p.jabatan}</p>
            </div>
          ))}
        </div>

        <div style={{ maxWidth: '50%', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '0.82rem' }}>MENGETAHUI / MENYETUJUI</p>
          <div style={{ height: 60, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            {sigMengetahui && <img src={sigMengetahui} alt="ttd" style={{ maxHeight: 56, maxWidth: '100%', objectFit: 'contain' }} />}
          </div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', borderTop: '1px solid #0f172a', paddingTop: 4 }}>
            {form.namaMengetahui || '.....................'}
          </p>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{form.jabatanMengetahui}</p>
        </div>
      </div>
    </div>
  );
}