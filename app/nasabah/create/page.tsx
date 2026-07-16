'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function CreateNasabahPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nama: '',
    nik: '',
    alamat: '',
    telepon: '',
    namaPasangan: '',
    nomorRekening: ''
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/nasabah', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await res.json();

      if (!res.ok) {
        setErrorMessage(result.error || 'Gagal menyimpan data nasabah.');
        setIsLoading(false);
        return;
      }

      setStatusMessage(`Berhasil! Nomor Register Anda: ${result.kodeRegister}`);
      setTimeout(() => {
        router.push('/nasabah');
      }, 3000);
    } catch (error) {
      setErrorMessage('Terjadi kesalahan jaringan.');
      setIsLoading(false);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 32, display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
          <Shield size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>Input Data Nasabah</h1>
          <p style={{ color: '#64748b', fontSize: '1.05rem', margin: 0 }}>Registrasi fasilitas kredit baru (Nomor Register digenerate otomatis)</p>
        </div>
      </div>

      <div className="card" style={{ padding: 32 }}>
        {statusMessage && <div className="alert alert-info" style={{ marginBottom: 24, fontSize: '1.1rem', fontWeight: 600 }}>{statusMessage}</div>}
        {errorMessage && <div className="alert alert-danger" style={{ marginBottom: 24 }}>{errorMessage}</div>}

        <form onSubmit={handleSubmit}>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            <div>
              <label className="label">Nomor Rekening</label>
              <input type="text" name="nomorRekening" className="inputField" value={formData.nomorRekening} onChange={handleChange} placeholder="Contoh: 001.23.45678" required />
            </div>
            <div>
              <label className="label">Nomor Induk Kependudukan (NIK)</label>
              <input type="text" name="nik" className="inputField" value={formData.nik} onChange={handleChange} placeholder="16 digit NIK" required />
            </div>
          </div>

          <div className="grid" style={{ gap: 24, marginBottom: 24 }}>
            <div>
              <label className="label">Nama Nasabah (Sesuai KTP)</label>
              <input type="text" name="nama" className="inputField" value={formData.nama} onChange={handleChange} required />
            </div>
            <div>
              <label className="label">Alamat Lengkap</label>
              <input type="text" name="alamat" className="inputField" value={formData.alamat} onChange={handleChange} />
            </div>
          </div>

          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
            <div>
              <label className="label">Nomor HP / Telepon</label>
              <input type="tel" name="telepon" className="inputField" value={formData.telepon} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Nama Pasangan (Suami/Istri)</label>
              <input type="text" name="namaPasangan" className="inputField" value={formData.namaPasangan} onChange={handleChange} placeholder="Kosongkan jika belum menikah" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', paddingTop: 24, borderTop: '1px solid #f1f5f9' }}>
            <Link href="/nasabah" className="button secondary">Batal</Link>
            <button type="submit" className="button" disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : 'Simpan Data Nasabah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
