'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  userId: number;
  userName: string;
  username: string;
  role: string;
};

export default function UserActions({ userId, userName, username, role }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleResetPassword = async () => {
    const confirmed = window.confirm(`Reset password untuk ${userName} (${username})? Password akan diubah ke default: Password123`);
    if (!confirmed) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/superadmin/users/${userId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: 'Password123' }),
      });

      const result = await res.json();
      if (!res.ok) {
        setMessage(result.error || 'Gagal mereset password.');
        setLoading(false);
        return;
      }

      setMessage(`Password ${username} berhasil direset. Password default: Password123`);
      setTimeout(() => router.refresh(), 800);
    } catch {
      setMessage('Terjadi kesalahan saat mereset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
      {message && <div className="alert alert-info" style={{ padding: '6px 10px', fontSize: '0.9rem' }}>{message}</div>}
      <button
        type="button"
        className="button secondary"
        disabled={loading}
        onClick={handleResetPassword}
      >
        {loading ? 'Memproses...' : 'Reset Password'}
      </button>
    </div>
  );
}
