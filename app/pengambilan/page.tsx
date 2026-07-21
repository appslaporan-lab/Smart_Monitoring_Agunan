import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import PengambilanForm from './PengambilanForm';

export const dynamic = 'force-dynamic';

export default async function PengambilanPage() {
  const user = getCurrentUser();
  if (!user) redirect('/auth/login');

  return (
    <main className="container">
      <section style={{ marginBottom: 32 }}>
        <h1>Pengambilan Agunan</h1>
        <p>Cari nasabah untuk memproses agunan keluar dari brankas.</p>
      </section>
      <div className="card" style={{ padding: 24 }}>
        <PengambilanForm userRole={user.role} />
      </div>
    </main>
  );
}