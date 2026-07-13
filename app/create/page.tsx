import { prisma } from '@/lib/prisma';
import CreateAgunanForm from './CreateAgunanForm';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function CreatePage() {
  const user = getCurrentUser();
  if (!user) {
    redirect('/auth/login');
  }

  const nasabahs = await prisma.nasabah.findMany({ orderBy: { nama: 'asc' } });

  return (
    <main className="container">
      <section style={{ marginBottom: 32 }}>
        <h1>Tambah Agunan</h1>
        <p>Tambah register agunan untuk nasabah baru atau nasabah yang sudah terdaftar.</p>
      </section>

      <div className="card" style={{ padding: 24 }}>
        <CreateAgunanForm nasabahs={nasabahs} />
      </div>
    </main>
  );
}
