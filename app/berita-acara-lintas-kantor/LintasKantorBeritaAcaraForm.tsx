'use client';

import { useState } from 'react';
import SignaturePad from '@/components/SignaturePad';

function formatTanggalIndo(dateStr: string) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
}

export default function LintasKantorBeritaAcaraForm() {
  const [alur, setAlur] = useState<'ALUR_1' | 'ALUR_2'>('ALUR_1');

  const [form, setForm] = useState({
    nomorDokumen: '',
    tanggalSerahTerima: new Date().toISOString().split('T')[0],
    nomorRekening: '',
    namaNasabah: '',
    alamat: '',
  });

  const [daftarAgunan, setDaftarAgunan] = useState([
    { jenis: '', identitas: '', namaPemilik: '' }
  ]);

  const [ttdPihak1Img, setTtdPihak1Img] = useState<string | null>(null);
  const [ttdPihak2Img, setTtdPihak2Img] = useState<string | null>(null);
  const [ttdMengetahuiImg, setTtdMengetahuiImg] = useState<string | null>(null);
  const [ttdMenyetujuiImg, setTtdMenyetujuiImg] = useState<string | null>(null);

  const [namaPihak1, setNamaPihak1] = useState('');
  const [namaPihak2, setNamaPihak2] = useState('');
  const [namaMengetahui, setNamaMengetahui] = useState('');
  const [namaMenyetujui, setNamaMenyetujui] = useState('');

  const updateField = (field: string, val: string) => {
    setForm(prev => ({ ...prev, [field]: val }));
  };

  const updateAgunanRow = (index: number, field: string, val: string) => {
    const copy = [...daftarAgunan];
    copy[index] = { ...copy[index], [field]: val };
    setDaftarAgunan(copy);
  };

  const addRow = () => {
    setDaftarAgunan([...daftarAgunan, { jenis: '', identitas: '', namaPemilik: '' }]);
  };

  const removeRow = (index: number) => {
    const copy = [...daftarAgunan];
    copy.splice(index, 1);
    setDaftarAgunan(copy);
  };

  // Label signatures based on Alur
  let sig1Label = '';
  let sig2Label = '';
  let sigMengetahuiLabel = '';
  let sigMenyetujuiLabel = '';

  if (alur === 'ALUR_1') {
    sig1Label = 'Yang Menyerahkan (Adm Kredit Pusat)';
    sig2Label = 'Yang Menerima (Pimpinan Cabang)';
    sigMengetahuiLabel = 'Mengetahui (Kabag Operasional)';
    sigMenyetujuiLabel = 'Menyetujui (Direktur)';
  } else {
    sig1Label = 'Yang Menyerahkan (Adm Kredit Cabang)';
    sig2Label = 'Yang Menerima (Adm Kredit Pusat)';
    sigMengetahuiLabel = 'Mengetahui (Pimpinan Cabang)';
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="ba-no-print" style={{ display: 'flex', flexDirection: 'column', gap: '24px', backgroundColor: '#fff', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 24 }}>
        
        <div className="ba-subsection">
          <p className="ba-subsection-label">Pilih Alur Penyerahan</p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="radio" name="alur" checked={alur === 'ALUR_1'} onChange={() => setAlur('ALUR_1')} />
              Alur 1 (Pusat ke Cabang)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="radio" name="alur" checked={alur === 'ALUR_2'} onChange={() => setAlur('ALUR_2')} />
              Alur 2 (Cabang ke Pusat)
            </label>
          </div>
        </div>

        <div className="ba-subsection">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="ba-subsection-label">Data Dokumen & Nasabah</p>
            <button type="button" className="button primary" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Cetak Dokumen
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: 12 }}>
            <div>
              <label className="label">Nomor Dokumen Berita Acara</label>
              <input className="inputField" placeholder="Misal: 001/BA/VIII/2026" value={form.nomorDokumen} onChange={(e) => updateField('nomorDokumen', e.target.value)} />
            </div>
            <div>
              <label className="label">Tanggal Serah Terima</label>
              <input type="date" className="inputField" value={form.tanggalSerahTerima} onChange={(e) => updateField('tanggalSerahTerima', e.target.value)} />
            </div>
            <div>
              <label className="label">Nomor Rekening</label>
              <input className="inputField" value={form.nomorRekening} onChange={(e) => updateField('nomorRekening', e.target.value)} />
            </div>
            <div>
              <label className="label">Nama Nasabah / Peminjam</label>
              <input className="inputField" value={form.namaNasabah} onChange={(e) => updateField('namaNasabah', e.target.value)} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="label">Alamat Nasabah</label>
              <input className="inputField" value={form.alamat} onChange={(e) => updateField('alamat', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="ba-subsection">
          <p className="ba-subsection-label">Daftar Agunan</p>
          {daftarAgunan.map((row, idx) => (
            <div key={idx} className="ba-agunan-row" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr auto', gap: 12, marginBottom: 8 }}>
              <input className="inputField" placeholder="Jenis Agunan" value={row.jenis} onChange={(e) => updateAgunanRow(idx, 'jenis', e.target.value)} />
              <input className="inputField" placeholder="No. BPKB / SHM / Plat" value={row.identitas} onChange={(e) => updateAgunanRow(idx, 'identitas', e.target.value)} />
              <input className="inputField" placeholder="Nama Pemilik" value={row.namaPemilik} onChange={(e) => updateAgunanRow(idx, 'namaPemilik', e.target.value)} />
              {daftarAgunan.length > 1 && (
                <button type="button" className="button danger" style={{ padding: '8px 12px' }} onClick={() => removeRow(idx)}>Hapus</button>
              )}
            </div>
          ))}
          <button type="button" className="button secondary" onClick={addRow} style={{ marginTop: 8 }}>+ Tambah Baris</button>
        </div>

        <div className="ba-subsection">
          <p className="ba-subsection-label">Tanda Tangan Digital</p>
          <div className="ba-sig-input-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            
            <div>
              <label className="label" style={{ marginBottom: 4 }}>{sig1Label}</label>
              <input className="inputField" style={{ marginBottom: 8 }} placeholder="Nama Terang" value={namaPihak1} onChange={(e) => setNamaPihak1(e.target.value)} />
              <SignaturePad label="TTD Pihak 1" onChange={setTtdPihak1Img} />
            </div>
            <div>
              <label className="label" style={{ marginBottom: 4 }}>{sig2Label}</label>
              <input className="inputField" style={{ marginBottom: 8 }} placeholder="Nama Terang" value={namaPihak2} onChange={(e) => setNamaPihak2(e.target.value)} />
              <SignaturePad label="TTD Pihak 2" onChange={setTtdPihak2Img} />
            </div>
            <div>
              <label className="label" style={{ marginBottom: 4 }}>{sigMengetahuiLabel}</label>
              <input className="inputField" style={{ marginBottom: 8 }} placeholder="Nama Terang" value={namaMengetahui} onChange={(e) => setNamaMengetahui(e.target.value)} />
              <SignaturePad label="TTD Mengetahui" onChange={setTtdMengetahuiImg} />
            </div>

            {alur === 'ALUR_1' && (
              <div>
                <label className="label" style={{ marginBottom: 4 }}>{sigMenyetujuiLabel}</label>
                <input className="inputField" style={{ marginBottom: 8 }} placeholder="Nama Terang" value={namaMenyetujui} onChange={(e) => setNamaMenyetujui(e.target.value)} />
                <SignaturePad label="TTD Menyetujui" onChange={setTtdMenyetujuiImg} />
              </div>
            )}
            
          </div>
        </div>

      </div>

      {/* DOKUMEN CETAK */}
      <div className="ba-manual-a4">
        
        {/* Header */}
        <div className="ba-doc-header">
          <img src="/logo-bpr-resmi.png" alt="Logo PT BPR Bank Tulungagung" crossOrigin="anonymous" className="ba-doc-logo" />
          <div className="ba-doc-instansi">
            <p className="ba-inst-nama">PT BPR BANK TULUNGAGUNG PERSERODA</p>
            <p className="ba-inst-sub">Jl. Pahlawan No. 1 Tulungagung - Telp. (0355) 321768</p>
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
          di bawah ini telah melakukan serah terima agunan dengan rincian nasabah sebagai berikut:
        </p>

        {/* Info Nasabah */}
        <div className="ba-info-box" style={{ marginBottom: '24px' }}>
          <table className="ba-info-table">
            <tbody>
              <tr>
                <td className="ba-td-label">Nomor Rekening</td>
                <td className="ba-td-sep">:</td>
                <td className="ba-td-val"><strong>{form.nomorRekening || '___________________________'}</strong></td>
              </tr>
              <tr>
                <td className="ba-td-label">Nama Nasabah</td>
                <td className="ba-td-sep">:</td>
                <td className="ba-td-val"><strong>{form.namaNasabah || '-'}</strong></td>
              </tr>
              <tr>
                <td className="ba-td-label">Alamat</td>
                <td className="ba-td-sep">:</td>
                <td className="ba-td-val">{form.alamat || '-'}</td>
              </tr>
            </tbody>
          </table>
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
        <div className="ba-ttd-section" style={{ marginTop: '40px' }}>
          <p className="ba-ttd-kota">Tulungagung, {formatTanggalIndo(form.tanggalSerahTerima)}</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginTop: '24px' }}>
            
            <div className="ba-ttd-block">
              <p className="ba-ttd-role">{sig1Label}</p>
              <div className="ba-ttd-canvas">
                {ttdPihak1Img && <img src={ttdPihak1Img} alt="TTD Pihak 1" className="ba-ttd-img" />}
              </div>
              <p className="ba-ttd-name">{namaPihak1 || '............................'}</p>
            </div>

            <div className="ba-ttd-block">
              <p className="ba-ttd-role">{sig2Label}</p>
              <div className="ba-ttd-canvas">
                {ttdPihak2Img && <img src={ttdPihak2Img} alt="TTD Pihak 2" className="ba-ttd-img" />}
              </div>
              <p className="ba-ttd-name">{namaPihak2 || '............................'}</p>
            </div>

            <div className="ba-ttd-block">
              <p className="ba-ttd-role">{sigMengetahuiLabel}</p>
              <div className="ba-ttd-canvas">
                {ttdMengetahuiImg && <img src={ttdMengetahuiImg} alt="TTD Mengetahui" className="ba-ttd-img" />}
              </div>
              <p className="ba-ttd-name">{namaMengetahui || '............................'}</p>
            </div>

            {alur === 'ALUR_1' && (
              <div className="ba-ttd-block">
                <p className="ba-ttd-role">{sigMenyetujuiLabel}</p>
                <div className="ba-ttd-canvas">
                  {ttdMenyetujuiImg && <img src={ttdMenyetujuiImg} alt="TTD Menyetujui" className="ba-ttd-img" />}
                </div>
                <p className="ba-ttd-name">{namaMenyetujui || '............................'}</p>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <p className="ba-doc-footer" style={{ marginTop: '60px' }}>
          Dokumen ini dicetak secara resmi untuk keperluan administrasi serah terima agunan Lintas Kantor - PT BPR Bank Tulungagung Perseroda
        </p>
      </div>
    </div>
  );
}
