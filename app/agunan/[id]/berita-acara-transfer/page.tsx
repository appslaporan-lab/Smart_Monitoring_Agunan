import { prisma } from '@/lib/prisma';
import BeritaAcaraTransferForm from './BeritaAcaraTransferForm';

export const dynamic = 'force-dynamic';

export default async function BeritaAcaraTransferPage({ params }: { params: { id: string } }) {
  const agunan = await prisma.agunan.findUnique({
    where: { id: Number(params.id) },
    include: { nasabah: true, registrasi: true },
  });

  if (!agunan) {
    return (
      <main className="container" style={{ paddingTop: 24 }}>
        <h1>Agunan tidak ditemukan</h1>
      </main>
    );
  }

  return (
    <main className="container" style={{ paddingTop: 24 }}>
      <h1>Berita Acara Serah Terima Agunan Lunas (Transfer Antar Cabang)</h1>
      <p>Formulir siap cetak untuk transfer agunan lunas ke cabang tujuan.</p>
      <BeritaAcaraTransferForm agunan={agunan as any} />
    </main>
  );
}