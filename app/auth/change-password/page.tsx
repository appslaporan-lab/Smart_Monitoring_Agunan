'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function ChangePasswordPage() {
  const searchParams = useSearchParams();
  const expired = searchParams.get('expired') === '1';
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const currentPassword = formData.get('currentPassword')?.toString() || '';
    const newPassword = formData.get('newPassword')?.toString() || '';
    const confirmPassword = formData.get('confirmPassword')?.toString() || '';

    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setError('Password minimal 8 karakter dan harus ada huruf serta angka.');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || 'Gagal mengubah password.');
      } else {
        setMessage(result.message || 'Password berhasil diubah.');
        event.currentTarget.reset();
      }
    } catch {
      setError('Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container" style={{ maxWidth: 560 }}>
      <section className="card" style={{ padding: 24 }}>
        <h1>Ganti Password</h1>
        <p>{expired ? 'Password Anda sudah melewati batas 3 bulan. Silakan ubah sekarang.' : 'Gunakan form ini untuk memperbarui password akun Anda.'}</p>

        {error && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-info">{message}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <div>
            <label className="label">Password Saat Ini</label>
            <input type="password" name="currentPassword" className="inputField" required />
          </div>
          <div>
            <label className="label">Password Baru</label>
            <input type="password" name="newPassword" className="inputField" required />
          </div>
          <div>
            <label className="label">Konfirmasi Password Baru</label>
            <input type="password" name="confirmPassword" className="inputField" required />
          </div>

          <button type="submit" className="button" disabled={loading}>
            {loading ? 'Memproses...' : 'Simpan Password Baru'}
          </button>
        </form>
      </section>
    </main>
  );
}
