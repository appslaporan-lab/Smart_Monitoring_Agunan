import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AOMappingForm from './AOMappingForm';

export const dynamic = 'force-dynamic';

export default async function AOMappingPage() {
  const user = getCurrentUser();
  if (!user || user.role !== 'SUPERADMIN') redirect('/');

  const aoList = await prisma.masterAo.findMany({
    orderBy: { rawName: 'asc' }
  });

  return (
    <main className="container">
      <section style={{ marginBottom: 32 }}>
        <h1>Mapping Nama AO</h1>
        <p>Sesuaikan nama AO (Marketing Officer) yang berasal dari file Excel agar rapi saat ditampilkan di Dashboard. AO yang kosong di Excel akan otomatis menggunakan nama <strong>Sub Kantor</strong> nasabah tersebut.</p>
      </section>

      <AOMappingForm initialData={aoList} />
    </main>
  );
}
