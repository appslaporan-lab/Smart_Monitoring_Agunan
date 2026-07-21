import { prisma } from '@/lib/prisma';
import BeritaAcaraPencairanForm from './BeritaAcaraPencairanForm';

export const dynamic = 'force-dynamic';

export default async function BeritaAcaraPencairanPage({ params }: { params: { id: string } }) {
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
      <h1>Berita Acara Serah Terima Agunan - Pencairan Ulang</h1>
      <p>Formulir siap cetak untuk agunan yang dipakai pencairan ulang.</p>
      <BeritaAcaraPencairanForm agunan={agunan as any} />
    </main>
  );
}