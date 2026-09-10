'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Check } from 'lucide-react';

const HASIL_OPTIONS = [
  { value: 'JANJI_BAYAR', label: 'Janji Bayar' },
  { value: 'BAYAR_SEBAGIAN', label: 'Bayar Sebagian' },
  { value: 'LUNAS', label: 'Lunas' },
  { value: 'TIDAK_KETEMU', label: 'Tidak Ketemu' },
  { value: 'MENOLAK', label: 'Menolak Bayar' },
];

const getMonthName = (month: number) => {
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return months[month - 1] || month;
};

export default function KunjunganForm({ 
  pinjamanPeriodeId,
  namaDebitur,
  angsuran,
  outstanding,
  bulanTagihan,
  tahunTagihan
}: { 
  pinjamanPeriodeId: number;
  namaDebitur?: string;
  angsuran?: number;
  outstanding?: number;
  bulanTagihan?: number;
  tahunTagihan?: number;
}) {
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
  const [copied, setCopied] = useState(false);

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

  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    setNominalDibayar(rawValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasil) {
      setStatusMessage('Pilih hasil kunjungan terlebih dahulu.');
      return;
    }
    if (!fotoDataUrl) {
      setStatusMessage('Foto dokumentasi wajib diunggah untuk menyimpan laporan.');
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
          nominalDibayar: nominalDibayar ? Number(nominalDibayar) : null,
          tanggalJanjiBayar: tanggalJanjiBayar || null,
          catatan,
          penerimaSurat: penerimaSurat || '',
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

  const isWaOrTelepon = jenisKontak === 'TELEPON' || jenisKontak === 'WHATSAPP';
  const tagihanMessage = `Yth Nasabah Bank Tulungagung. Diinformasikan bahwa tagihan Pinjaman Bapak/Ibu akan segera Jatuh Tempo pada ${bulanTagihan ? getMonthName(bulanTagihan) : ''} ${tahunTagihan || ''} dengan keterangan sebagai berikut :
Nama Debitur : ${namaDebitur || '-'}
Jumlah angsuran : Rp ${(angsuran || 0).toLocaleString('id-ID')}
Sisa Pinjaman : Rp ${(outstanding || 0).toLocaleString('id-ID')}

Pastikan dana tersedia pada saldo rekening tabungan Bank Tulungagung yang terdaftar untuk pendebetan angsuran pinjaman Anda 1 hari sebelum jatuh tempo Bapak/Ibu.
Abaikan pesan ini apabila telah melakukan pembayaran tagihan pinjaman anda.
Terimakasih, selamat beraktifitas dan selalu jaga kesehatan.`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(tagihanMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <form onSubmit={handleSubmit}>
      {statusMessage && <div className="alert alert-info" style={{ marginBottom: 16 }}>{statusMessage}</div>}

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
            <option value="WHATSAPP">WhatsApp</option>
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
          <input 
            className="inputField" 
            type="text" 
            placeholder="Misal: 1.500.000"
            value={nominalDibayar ? Number(nominalDibayar).toLocaleString('id-ID') : ''} 
            onChange={handleNominalChange} 
          />
        </div>
        <div>
          <label className="label">Tanggal Janji Bayar (jika ada)</label>
          <input className="inputField" type="date" value={tanggalJanjiBayar} onChange={(e) => setTanggalJanjiBayar(e.target.value)} />
        </div>
        <div>
          <label className="label">Foto Dokumentasi (Wajib)</label>
          <input className="inputField" type="file" accept="image/*" required onChange={handlePhotoChange} />
        </div>
      </div>

      {isWaOrTelepon && (
        <div style={{ marginBottom: 16, padding: 16, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label className="label" style={{ margin: 0, color: '#334155' }}>Template Pesan Tagihan (Telepon/WA)</label>
            <button type="button" onClick={copyToClipboard} className="button" style={{ padding: '4px 8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
              {copied ? <Check size={14} color="green" /> : <Copy size={14} />}
              {copied ? 'Tersalin!' : 'Salin Pesan'}
            </button>
          </div>
          <textarea 
            readOnly 
            className="inputField" 
            style={{ fontSize: '0.9rem', color: '#475569', background: '#fff', cursor: 'text', height: 180 }}
            value={tagihanMessage}
          />
        </div>
      )}

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