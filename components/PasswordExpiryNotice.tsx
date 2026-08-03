import Link from 'next/link';

type Props = {
  daysRemaining: number;
  isExpired: boolean;
};

export default function PasswordExpiryNotice({ daysRemaining, isExpired }: Props) {
  if (!isExpired && daysRemaining > 14) return null;

  const title = isExpired ? 'Password Anda sudah kedaluwarsa' : 'Password Anda akan segera kedaluwarsa';
  const message = isExpired
    ? 'Silakan ganti password sekarang agar akun tetap aman.'
    : `Password Anda akan kedaluwarsa dalam ${daysRemaining} hari. Sebaiknya ganti sekarang.`;

  return (
    <div style={{
      marginBottom: 16,
      padding: '12px 14px',
      borderRadius: 10,
      border: isExpired ? '1px solid #f59e0b' : '1px solid #60a5fa',
      background: isExpired ? '#fff7ed' : '#eff6ff',
      color: '#1f2937',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
      flexWrap: 'wrap',
    }}>
      <div>
        <strong>{title}</strong>
        <div style={{ fontSize: '0.95rem', marginTop: 4 }}>{message}</div>
      </div>
      <Link href="/auth/change-password" className="button secondary" style={{ whiteSpace: 'nowrap' }}>
        Ganti Password
      </Link>
    </div>
  );
}
