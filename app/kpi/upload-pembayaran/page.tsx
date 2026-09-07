import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import UploadPembayaranForm from './UploadPembayaranForm';

export const dynamic = 'force-dynamic';

export default async function UploadPembayaranPage() {
  const user = getCurrentUser();
  if (!user) redirect('/auth/login');
  if (user.role !== 'SUPERADMIN' && user.role !== 'TELLER') redirect('/collecting');

  return (
    <main className="container">
      <section style={{ marginBottom: 32 }}>
        <h1>Upload Laporan Pembayaran</h1>
        <p>Unggah file Excel laporan pembayaran (Tunai / Non-Tunai) untuk mengupdate status nasabah menjadi Sudah Bayar atau Lunas.</p>
      </section>

      <UploadPembayaranForm />
    </main>
  );
}
