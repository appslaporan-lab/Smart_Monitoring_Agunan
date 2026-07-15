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
  const [nomorRekening, setNomorRekening] = useState('');
  const [newNasabah, setNewNasabah] = useState({ nama: '', nik: '', alamat: '', telepon: '' });

  const [jenis, setJenis] = useState('BPKB');
  const [deskripsi, setDeskripsi] = useState('');
  const [tujuan, setTujuan] = useState('');
  const [warningPesan, setWarningPesan] = useState('');

  const [jenisKendaraan, setJenisKendaraan] = useState('MOBIL');
  const [tahunPembuatan, setTahunPembuatan] = useState('');
  const [nomorBPKB, setNomorBPKB] = useState('');
  const [noRangka, setNoRangka] = useState('');
  const [noMesin, setNoMesin] = useState('');
  const [namaPemilik, setNamaPemilik] = useState('');
  const [nomorPolisi, setNomorPolisi] = useState('');
  const [her5Reminder, setHer5Reminder] = useState('');

  const [nomorSHM, setNomorSHM] = useState('');
  const [namaPemilikSHM, setNamaPemilikSHM] = useState('');

  const [beratEmas, setBeratEmas] = useState('');
  const [karatEmas, setKaratEmas] = useState('');
  const [taksiranHarga, setTaksiranHarga] = useState('');

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateNewNasabah = (key: string, value: string) => {
    setNewNasabah((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);

    const payload: any = {
      jenis,
      deskripsi,
      tujuan,
      warningPesan,
      nomorRekening,
    };

    if (jenis === 'BPKB' || jenis === 'KENDARAAN') {
      payload.jenisKendaraan = jenisKendaraan;
      payload.tahunPembuatan = tahunPembuatan;
      payload.nomorBPKB = nomorBPKB;
      payload.noRangka = noRangka;
      payload.noMesin = noMesin;
      payload.namaPemilik = namaPemilik;
      payload.nomorPolisi = nomorPolisi;
      payload.her5Reminder = her5Reminder || null;
    } else if (jenis === 'SERTIFIKAT') {
      payload.nomorSHM = nomorSHM;
      payload.namaPemilikSHM = namaPemilikSHM;
    } else if (jenis === 'EMAS') {
      payload.beratEmas = beratEmas;
      payload.karatEmas = karatEmas;
      payload.taksiranHarga = taksiranHarga;
    }

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
        setErrorMessage(result.error || 'Gagal menyimpan data agunan.');
        return;
      }

      setStatusMessage(`Data agunan berhasil disimpan. Nomor Register: ${result.kodeRegister}. Status: Di Brankas.`);
      setTimeout(() => router.push('/'), 1800);
    } catch (error) {
      setErrorMessage('Terjadi kesalahan saat menghubungkan server.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid" style={{ gap: 18 }}>
      {statusMessage && <div className="alert alert-info">{statusMessage}</div>}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      <h2>Data Nasabah</h2>

      <div>
        <label className="label">Pilih Nasabah</label>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button type="button" className="button secondary" onClick={() => setMode('existing')}>
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
          <select className="inputField" value={selectedNasabahId} onChange={(e) => setSelectedNasabahId(e.target.value)}>
            <option value="">Pilih nasabah</option>
            {nasabahs.map((n) => (
              <option key={n.id} value={n.id}>{n.nama} — {n.nik}</option>
            ))}
          </select>
        </div>
      ) : (
        <div className="grid">
          <div>
            <label className="label">Nama Nasabah</label>
            <input className="inputField" value={newNasabah.nama} onChange={(e) => updateNewNasabah('nama', e.target.value)} required />
          </div>
          <div>
            <label className="label">NIK</label>
            <input className="inputField" value={newNasabah.nik} onChange={(e) => updateNewNasabah('nik', e.target.value)} required />
          </div>
          <div>
            <label className="label">Alamat</label>
            <input className="inputField" value={newNasabah.alamat} onChange={(e) => updateNewNasabah('alamat', e.target.value)} />
          </div>
          <div>
            <label className="label">Nomor HP</label>
            <input className="inputField" value={newNasabah.telepon} onChange={(e) => updateNewNasabah('telepon', e.target.value)} />
          </div>
        </div>
      )}

      <div>
        <label className="label">Nomor Rekening Pinjaman</label>
        <input className="inputField" value={nomorRekening} onChange={(e) => setNomorRekening(e.target.value)} required />
      </div>

      <hr />
      <h2>Data Agunan</h2>

      <div>
        <label className="label">Jenis Agunan</label>
        <select className="inputField" value={jenis} onChange={(e) => setJenis(e.target.value)}>
          <option value="BPKB">BPKB</option>
          <option value="SERTIFIKAT">SHM (Sertifikat)</option>
          <option value="EMAS">Emas</option>
          <option value="KENDARAAN">Kendaraan (non-BPKB)</option>
          <option value="LAINNYA">Lainnya</option>
        </select>
      </div>

      {(jenis === 'BPKB' || jenis === 'KENDARAAN') && (
        <div className="grid" style={{ gap: 16 }}>
          <div>
            <label className="label">Jenis Kendaraan</label>
            <select className="inputField" value={jenisKendaraan} onChange={(e) => setJenisKendaraan(e.target.value)}>
              <option value="MOBIL">Mobil</option>
              <option value="MOTOR">Motor</option>
              <option value="TRUCK">Truck</option>
              <option value="LAINNYA">Lainnya</option>
            </select>
          </div>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="label">Tahun Pembuatan</label>
              <input className="inputField" value={tahunPembuatan} onChange={(e) => setTahunPembuatan(e.target.value)} />
            </div>
            <div>
              <label className="label">Nomor BPKB</label>
              <input className="inputField" value={nomorBPKB} onChange={(e) => setNomorBPKB(e.target.value)} />
            </div>
          </div>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="label">Nomor Rangka</label>
              <input className="inputField" value={noRangka} onChange={(e) => setNoRangka(e.target.value)} />
            </div>
            <div>
              <label className="label">Nomor Mesin</label>
              <input className="inputField" value={noMesin} onChange={(e) => setNoMesin(e.target.value)} />
            </div>
          </div>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="label">Atas Nama BPKB</label>
              <input className="inputField" value={namaPemilik} onChange={(e) => setNamaPemilik(e.target.value)} />
            </div>
            <div>
              <label className="label">Nomor Plat</label>
              <input className="inputField" value={nomorPolisi} onChange={(e) => setNomorPolisi(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Pengingat HER 5 Tahunan</label>
            <input className="inputField" type="date" value={her5Reminder} onChange={(e) => setHer5Reminder(e.target.value)} />
          </div>
        </div>
      )}

      {jenis === 'SERTIFIKAT' && (
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label className="label">Nomor SHM</label>
            <input className="inputField" value={nomorSHM} onChange={(e) => setNomorSHM(e.target.value)} />
          </div>
          <div>
            <label className="label">Nama Pemilik SHM</label>
            <input className="inputField" value={namaPemilikSHM} onChange={(e) => setNamaPemilikSHM(e.target.value)} />
          </div>
        </div>
      )}

      {jenis === 'EMAS' && (
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <div>
            <label className="label">Berat (gram)</label>
            <input className="inputField" type="number" step="0.01" value={beratEmas} onChange={(e) => setBeratEmas(e.target.value)} />
          </div>
          <div>
            <label className="label">Karat</label>
            <input className="inputField" value={karatEmas} onChange={(e) => setKaratEmas(e.target.value)} placeholder="Contoh: 24K" />
          </div>
          <div>
            <label className="label">Taksiran Harga (Rp)</label>
            <input className="inputField" type="number" value={taksiranHarga} onChange={(e) => setTaksiranHarga(e.target.value)} />
          </div>
        </div>
      )}

      <div>
        <label className="label">Deskripsi / Catatan Tambahan</label>
        <textarea className="inputField" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} rows={3} />
      </div>

      <div>
        <label className="label">Tujuan / Keterangan</label>
        <input className="inputField" value={tujuan} onChange={(e) => setTujuan(e.target.value)} placeholder="Contoh: Pencairan baru, re-disburse" />
      </div>

      <div>
        <label className="label">Peringatan / Catatan Khusus</label>
        <textarea className="inputField" value={warningPesan} onChange={(e) => setWarningPesan(e.target.value)} rows={2} />
      </div>

      <button type="submit" className="button">Simpan Data Agunan</button>
    </form>
  );
}