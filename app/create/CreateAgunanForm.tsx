'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, Trash2 } from 'lucide-react';

type Registrasi = {
  id: number;
  kodeRegister: string;
  nasabah: {
    nama: string;
    nik: string;
  };
};

const AGUNAN_INITIAL_STATE = {
  jenis: 'BPKB',
  deskripsi: '',
  nomorBPKB: '',
  jenisKendaraan: 'MOBIL',
  nomorPolisi: '',
  noRangka: '',
  noMesin: '',
  namaPemilik: '',
  alamatBPKB: '',
  nomorSHM: '',
  namaPemilikSHM: '',
  lokasiSHM: '',
  luas: '',
  nomorSK: '',
  namaSK: '',
  jabatan: '',
  nomorDeposito: '',
  namaDeposito: '',
  nominalDeposito: '',
};

export default function CreateAgunanForm({ registrasis }: { registrasis: Registrasi[] }) {
  const router = useRouter();
  const [selectedRegistrasiId, setSelectedRegistrasiId] = useState('');
  const [agunans, setAgunans] = useState([{ ...AGUNAN_INITIAL_STATE, id: Date.now() }]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const addAgunan = () => {
    setAgunans([...agunans, { ...AGUNAN_INITIAL_STATE, id: Date.now() }]);
  };

  const removeAgunan = (id: number) => {
    if (agunans.length === 1) return;
    setAgunans(agunans.filter(a => a.id !== id));
  };

  const updateAgunan = (id: number, field: string, value: string) => {
    setAgunans(agunans.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);

    if (!selectedRegistrasiId) {
      setErrorMessage('Silakan pilih Nomor Register Nasabah terlebih dahulu.');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        registrasiId: selectedRegistrasiId,
        agunans: agunans.map(({ id, ...rest }) => rest), // remove internal id
      };

      const res = await fetch('/api/agunan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (!res.ok) {
        setErrorMessage(result.error || 'Gagal menyimpan data agunan.');
        setIsLoading(false);
        return;
      }

      setStatusMessage(`Berhasil menyimpan ${result.count} data agunan ke Register: ${result.kodeRegister}`);
      setTimeout(() => router.push('/agunan'), 2000);
    } catch (error) {
      setErrorMessage('Terjadi kesalahan jaringan.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {statusMessage && <div className="alert alert-info" style={{ marginBottom: 24, fontSize: '1.1rem', fontWeight: 600 }}>{statusMessage}</div>}
      {errorMessage && <div className="alert alert-danger" style={{ marginBottom: 24 }}>{errorMessage}</div>}

      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h2 style={{ margin: '0 0 16px', fontSize: '1.2rem' }}>1. Pilih Nasabah (Nomor Register)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label className="label">Cari Berdasarkan Nomor Register / Nama</label>
          <select className="inputField" value={selectedRegistrasiId} onChange={(e) => setSelectedRegistrasiId(e.target.value)} required>
            <option value="">-- Pilih Nomor Register --</option>
            {registrasis.map((reg) => (
              <option key={reg.id} value={reg.id}>
                {reg.kodeRegister} — {reg.nasabah.nama} (NIK: {reg.nasabah.nik})
              </option>
            ))}
          </select>
        </div>
      </div>

      <h2 style={{ margin: '32px 0 16px', fontSize: '1.2rem', color: '#0f172a' }}>2. Input Detail Agunan</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {agunans.map((agunan, index) => (
          <div key={agunan.id} className="card" style={{ padding: 24, position: 'relative', borderLeft: '4px solid #3b82f6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>Agunan #{index + 1}</h3>
              {agunans.length > 1 && (
                <button type="button" onClick={() => removeAgunan(agunan.id)} className="button danger" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                  <Trash2 size={16} style={{ display: 'inline', marginRight: 4 }} /> Hapus
                </button>
              )}
            </div>

            <div className="grid" style={{ gap: 20 }}>
              <div>
                <label className="label">Jenis Agunan</label>
                <select className="inputField" value={agunan.jenis} onChange={(e) => updateAgunan(agunan.id, 'jenis', e.target.value)}>
                  <option value="BPKB">BPKB</option>
                  <option value="SHM">SHM</option>
                  <option value="SK">SK</option>
                  <option value="AKTA_TANAH">Akta Tanah</option>
                  <option value="DEPOSITO">Deposito</option>
                  <option value="LAINNYA">Lain-lain</option>
                </select>
              </div>

              {agunan.jenis === 'BPKB' && (
                <div className="grid" style={{ gap: 16 }}>
                  <div>
                    <label className="label">Jenis Kendaraan</label>
                    <select className="inputField" value={agunan.jenisKendaraan} onChange={(e) => updateAgunan(agunan.id, 'jenisKendaraan', e.target.value)}>
                      <option value="MOBIL">Mobil</option>
                      <option value="MOTOR">Motor</option>
                      <option value="TRUCK">Truck</option>
                      <option value="LAINNYA">Lainnya</option>
                    </select>
                  </div>
                  <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label className="label">Nomor BPKB</label>
                      <input className="inputField" value={agunan.nomorBPKB} onChange={(e) => updateAgunan(agunan.id, 'nomorBPKB', e.target.value)} required />
                    </div>
                    <div>
                      <label className="label">Nomor Plat Polisi</label>
                      <input className="inputField" value={agunan.nomorPolisi} onChange={(e) => updateAgunan(agunan.id, 'nomorPolisi', e.target.value)} required />
                    </div>
                  </div>
                  <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label className="label">Nomor Rangka</label>
                      <input className="inputField" value={agunan.noRangka} onChange={(e) => updateAgunan(agunan.id, 'noRangka', e.target.value)} />
                    </div>
                    <div>
                      <label className="label">Nomor Mesin</label>
                      <input className="inputField" value={agunan.noMesin} onChange={(e) => updateAgunan(agunan.id, 'noMesin', e.target.value)} />
                    </div>
                  </div>
                  <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label className="label">Atas Nama BPKB</label>
                      <input className="inputField" value={agunan.namaPemilik} onChange={(e) => updateAgunan(agunan.id, 'namaPemilik', e.target.value)} required />
                    </div>
                    <div>
                      <label className="label">Alamat Sesuai BPKB</label>
                      <input className="inputField" value={agunan.alamatBPKB} onChange={(e) => updateAgunan(agunan.id, 'alamatBPKB', e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {(agunan.jenis === 'SHM' || agunan.jenis === 'AKTA_TANAH') && (
                <div className="grid" style={{ gap: 16 }}>
                  <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label className="label">Nomor {agunan.jenis === 'SHM' ? 'SHM' : 'Akta'}</label>
                      <input className="inputField" value={agunan.nomorSHM} onChange={(e) => updateAgunan(agunan.id, 'nomorSHM', e.target.value)} required />
                    </div>
                    <div>
                      <label className="label">Nama {agunan.jenis === 'SHM' ? 'SHM' : 'Akta'}</label>
                      <input className="inputField" value={agunan.namaPemilikSHM} onChange={(e) => updateAgunan(agunan.id, 'namaPemilikSHM', e.target.value)} required />
                    </div>
                  </div>
                  <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label className="label">Lokasi</label>
                      <input className="inputField" value={agunan.lokasiSHM} onChange={(e) => updateAgunan(agunan.id, 'lokasiSHM', e.target.value)} />
                    </div>
                    <div>
                      <label className="label">Luas</label>
                      <input className="inputField" value={agunan.luas} onChange={(e) => updateAgunan(agunan.id, 'luas', e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {agunan.jenis === 'SK' && (
                <div className="grid" style={{ gap: 16 }}>
                  <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label className="label">Nomor SK</label>
                      <input className="inputField" value={agunan.nomorSK} onChange={(e) => updateAgunan(agunan.id, 'nomorSK', e.target.value)} required />
                    </div>
                    <div>
                      <label className="label">Nama di SK</label>
                      <input className="inputField" value={agunan.namaSK} onChange={(e) => updateAgunan(agunan.id, 'namaSK', e.target.value)} required />
                    </div>
                  </div>
                  <div>
                    <label className="label">Jabatan</label>
                    <input className="inputField" value={agunan.jabatan} onChange={(e) => updateAgunan(agunan.id, 'jabatan', e.target.value)} />
                  </div>
                </div>
              )}

              {agunan.jenis === 'DEPOSITO' && (
                <div className="grid" style={{ gap: 16 }}>
                  <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label className="label">Nomor Deposito</label>
                      <input className="inputField" value={agunan.nomorDeposito} onChange={(e) => updateAgunan(agunan.id, 'nomorDeposito', e.target.value)} required />
                    </div>
                    <div>
                      <label className="label">Nama Deposito</label>
                      <input className="inputField" value={agunan.namaDeposito} onChange={(e) => updateAgunan(agunan.id, 'namaDeposito', e.target.value)} required />
                    </div>
                  </div>
                  <div>
                    <label className="label">Nominal (Rp)</label>
                    <input type="number" className="inputField" value={agunan.nominalDeposito} onChange={(e) => updateAgunan(agunan.id, 'nominalDeposito', e.target.value)} required />
                  </div>
                </div>
              )}

              {agunan.jenis === 'LAINNYA' && (
                <div>
                  <label className="label">Keterangan Agunan</label>
                  <textarea className="inputField" value={agunan.deskripsi} onChange={(e) => updateAgunan(agunan.id, 'deskripsi', e.target.value)} rows={3} required />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, display: 'flex', gap: 16, justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" onClick={addAgunan} className="button secondary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <PlusCircle size={18} /> Tambah Agunan (Bila lebih dari satu)
        </button>

        <button type="submit" className="button" disabled={isLoading} style={{ minWidth: 200 }}>
          {isLoading ? 'Menyimpan...' : 'Simpan Semua Agunan'}
        </button>
      </div>
    </form>
  );
}