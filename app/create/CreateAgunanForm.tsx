'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

type Registrasi = {
  id: number;
  kodeRegister: string;
  nomorRekening: string | null;
  nasabah: {
    id: number;
    nama: string;
    nik: string;
  };
};

export default function CreateAgunanForm({ registrasis }: { registrasis: Registrasi[] }) {  const router = useRouter();
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [selectedRegistrasiId, setSelectedRegistrasiId] = useState('');
  const [nomorRekening, setNomorRekening] = useState('');
  const [newNasabah, setNewNasabah] = useState({
    nama: '', nik: '', alamat: '', telepon: '',
    statusPernikahan: 'BELUM_NIKAH', namaPasangan: '',
  });

  const [jenis, setJenis] = useState('BPKB');
  const [deskripsi, setDeskripsi] = useState('');
  const [tujuan, setTujuan] = useState('');
  const [warningPesan, setWarningPesan] = useState('');

  const [jenisKendaraan, setJenisKendaraan] = useState('MOBIL');
  const [nomorPolisi, setNomorPolisi] = useState('');
  const [namaPemilik, setNamaPemilik] = useState('');
  const [merk, setMerk] = useState('');
  const [tipeKendaraan, setTipeKendaraan] = useState('');
  const [warna, setWarna] = useState('');
  const [tahunPembuatan, setTahunPembuatan] = useState('');
  const [noRangka, setNoRangka] = useState('');
  const [noMesin, setNoMesin] = useState('');
  const [nomorBPKB, setNomorBPKB] = useState('');
  const [her5Reminder, setHer5Reminder] = useState('');

  const [nomorSHM, setNomorSHM] = useState('');
  const [namaPemilikSHM, setNamaPemilikSHM] = useState('');
  const [lokasiTanah, setLokasiTanah] = useState('');
  const [luasTanah, setLuasTanah] = useState('');

  const [nomorSK, setNomorSK] = useState('');
  const [namaPemilikSK, setNamaPemilikSK] = useState('');
  const [dinasDesa, setDinasDesa] = useState('');

  const [beratEmas, setBeratEmas] = useState('');
  const [karatEmas, setKaratEmas] = useState('');
  const [taksiranHarga, setTaksiranHarga] = useState('');

  const [nomorCovernote, setNomorCovernote] = useState('');
  const [tanggalTerbitCovernote, setTanggalTerbitCovernote] = useState('');
  const [nomorAJB, setNomorAJB] = useState('');
  const [atasNamaSertifikasi, setAtasNamaSertifikasi] = useState('');
  const [letakTanahSertifikasi, setLetakTanahSertifikasi] = useState('');
  const [luasSertifikasi, setLuasSertifikasi] = useState('');
  const [perkiraanJadiSHM, setPerkiraanJadiSHM] = useState('');

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateNewNasabah = (key: string, value: string) => {
    setNewNasabah((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);

    const payload: any = { jenis, deskripsi, tujuan, warningPesan, nomorRekening };

    if (jenis === 'BPKB') {
      Object.assign(payload, {
        jenisKendaraan, nomorPolisi, namaPemilik, merk, tipeKendaraan, warna,
        tahunPembuatan, noRangka, noMesin, nomorBPKB, her5Reminder: her5Reminder || null,
      });
    } else if (jenis === 'SHM_AJB') {
      Object.assign(payload, { nomorSHM, namaPemilikSHM, lokasiTanah, luasTanah });
    } else if (jenis === 'SK') {
      Object.assign(payload, { nomorSK, namaPemilikSK, dinasDesa });
    } else if (jenis === 'EMAS' || jenis === 'DEPOSITO') {
      Object.assign(payload, { beratEmas, karatEmas, taksiranHarga });
    } else if (jenis === 'PROSES_SERTIFIKASI') {
      Object.assign(payload, {
        nomorCovernote, tanggalTerbitCovernote: tanggalTerbitCovernote || null,
        nomorAJB, atasNamaSertifikasi, letakTanahSertifikasi, luasSertifikasi,
        perkiraanJadiSHM: perkiraanJadiSHM || null,
      });
    }

    if (mode === 'existing') {
      const selected = registrasis.find((r) => r.id === Number(selectedRegistrasiId));
      payload.nasabahId = selected?.nasabah.id;
      if (!payload.nomorRekening && selected?.nomorRekening) {
        payload.nomorRekening = selected.nomorRekening;
      }
    } else {
      payload.newNasabah = { ...newNasabah };
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

      setStatusMessage(`Data agunan berhasil disimpan. Nomor Register: ${result.kodeRegister}. Status: ${result.status}.`);
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
          <button type="button" className="button secondary" onClick={() => setMode('existing')}>Nasabah Terdaftar</button>
          <button type="button" className="button" onClick={() => setMode('new')}>Nasabah Baru</button>
        </div>
      </div>

      {mode === 'existing' ? (
        <div>
          <label className="label">Pilih Register / Nasabah</label>
          <select className="inputField" value={selectedRegistrasiId} onChange={(e) => setSelectedRegistrasiId(e.target.value)}>
            <option value="">Pilih register aktif</option>
            {registrasis.map((r) => (
              <option key={r.id} value={r.id}>{r.kodeRegister} — {r.nasabah.nama} ({r.nasabah.nik})</option>
            ))}
          </select>
        </div>
      ) : (
        <div className="grid" style={{ gap: 16 }}>
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
          <div>
            <label className="label">Status Pernikahan</label>
            <select className="inputField" value={newNasabah.statusPernikahan} onChange={(e) => updateNewNasabah('statusPernikahan', e.target.value)}>
              <option value="BELUM_NIKAH">Belum Menikah</option>
              <option value="MENIKAH">Menikah</option>
              <option value="JANDA">Janda</option>
              <option value="DUDA">Duda</option>
            </select>
          </div>
          {newNasabah.statusPernikahan === 'MENIKAH' && (
            <div>
              <label className="label">Nama Pasangan</label>
              <input className="inputField" value={newNasabah.namaPasangan} onChange={(e) => updateNewNasabah('namaPasangan', e.target.value)} />
            </div>
          )}
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
          <option value="SHM_AJB">SHM / AJB dan sejenisnya</option>
          <option value="SK">SK</option>
          <option value="EMAS">Emas</option>
          <option value="DEPOSITO">Deposito</option>
          <option value="PROSES_SERTIFIKASI">Proses Sertifikasi</option>
          <option value="LAINNYA">Lainnya</option>
        </select>
      </div>

      {jenis === 'BPKB' && (
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
              <label className="label">Nomor Plat</label>
              <input className="inputField" value={nomorPolisi} onChange={(e) => setNomorPolisi(e.target.value)} />
            </div>
            <div>
              <label className="label">Nama Pemilik</label>
              <input className="inputField" value={namaPemilik} onChange={(e) => setNamaPemilik(e.target.value)} />
            </div>
          </div>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div>
              <label className="label">Merk</label>
              <input className="inputField" value={merk} onChange={(e) => setMerk(e.target.value)} />
            </div>
            <div>
              <label className="label">Type</label>
              <input className="inputField" value={tipeKendaraan} onChange={(e) => setTipeKendaraan(e.target.value)} />
            </div>
            <div>
              <label className="label">Warna</label>
              <input className="inputField" value={warna} onChange={(e) => setWarna(e.target.value)} />
            </div>
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
          <div>
            <label className="label">Pengingat HER 5 Tahunan</label>
            <input className="inputField" type="date" value={her5Reminder} onChange={(e) => setHer5Reminder(e.target.value)} />
          </div>
        </div>
      )}

      {jenis === 'SHM_AJB' && (
        <div className="grid" style={{ gap: 16 }}>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="label">Nomor SHM / Akta</label>
              <input className="inputField" value={nomorSHM} onChange={(e) => setNomorSHM(e.target.value)} />
            </div>
            <div>
              <label className="label">Nama Pemilik</label>
              <input className="inputField" value={namaPemilikSHM} onChange={(e) => setNamaPemilikSHM(e.target.value)} />
            </div>
          </div>
          <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: 16 }}>
            <div>
              <label className="label">Lokasi Tanah</label>
              <input className="inputField" value={lokasiTanah} onChange={(e) => setLokasiTanah(e.target.value)} />
            </div>
            <div>
              <label className="label">Luas (m2)</label>
              <input className="inputField" type="number" value={luasTanah} onChange={(e) => setLuasTanah(e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {jenis === 'SK' && (
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <div>
            <label className="label">Nomor SK</label>
            <input className="inputField" value={nomorSK} onChange={(e) => setNomorSK(e.target.value)} />
          </div>
          <div>
            <label className="label">Nama Pemilik SK</label>
            <input className="inputField" value={namaPemilikSK} onChange={(e) => setNamaPemilikSK(e.target.value)} />
          </div>
          <div>
            <label className="label">Dinas / Desa</label>
            <input className="inputField" value={dinasDesa} onChange={(e) => setDinasDesa(e.target.value)} />
          </div>
        </div>
      )}

      {(jenis === 'EMAS' || jenis === 'DEPOSITO') && (
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

      {jenis === 'PROSES_SERTIFIKASI' && (
        <div className="grid" style={{ gap: 16 }}>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="label">Nomor Covernote</label>
              <input className="inputField" value={nomorCovernote} onChange={(e) => setNomorCovernote(e.target.value)} />
            </div>
            <div>
              <label className="label">Tanggal Terbit</label>
              <input className="inputField" type="date" value={tanggalTerbitCovernote} onChange={(e) => setTanggalTerbitCovernote(e.target.value)} />
            </div>
          </div>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="label">Nomor AJB</label>
              <input className="inputField" value={nomorAJB} onChange={(e) => setNomorAJB(e.target.value)} />
            </div>
            <div>
              <label className="label">Atas Nama</label>
              <input className="inputField" value={atasNamaSertifikasi} onChange={(e) => setAtasNamaSertifikasi(e.target.value)} />
            </div>
          </div>
          <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: 16 }}>
            <div>
              <label className="label">Letak Tanah</label>
              <input className="inputField" value={letakTanahSertifikasi} onChange={(e) => setLetakTanahSertifikasi(e.target.value)} />
            </div>
            <div>
              <label className="label">Luas (m2)</label>
              <input className="inputField" type="number" value={luasSertifikasi} onChange={(e) => setLuasSertifikasi(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Perkiraan Jadi SHM</label>
            <input className="inputField" type="date" value={perkiraanJadiSHM} onChange={(e) => setPerkiraanJadiSHM(e.target.value)} />
          </div>
        </div>
      )}

      <div>
        <label className="label">Deskripsi / Catatan Tambahan</label>
        <textarea className="inputField" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} rows={3} />
      </div>

      <div>
        <label className="label">Tujuan / Keterangan</label>
        <input className="inputField" value={tujuan} onChange={(e) => setTujuan(e.target.value)} placeholder="Contoh: Pencairan baru" />
      </div>

      <div>
        <label className="label">Peringatan / Catatan Khusus</label>
        <textarea className="inputField" value={warningPesan} onChange={(e) => setWarningPesan(e.target.value)} rows={2} />
      </div>

      <button type="submit" className="button">Simpan Data Agunan</button>
    </form>
  );
}