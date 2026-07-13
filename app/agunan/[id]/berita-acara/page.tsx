import { prisma } from '@/lib/prisma';
import BeritaAcaraForm from './BeritaAcaraForm';

export const metadata = {
  title: 'Berita Acara Serah Terima',
};

export default async function BeritaAcaraPage({ params }: { params: { id: string } }) {
  const agunan = await prisma.agunan.findUnique({
    where: { id: Number(params.id) },
    include: { nasabah: true },
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
      <h1>Berita Acara Serah Terima Agunan</h1>
      <p>Form ini dirancang untuk pencetakan satu lembar A4 dan dapat digunakan untuk agunan yang telah diserahkan ke nasabah yang lunas.</p>
      <BeritaAcaraForm agunan={agunan} />
    </main>
  );
}
