import { prisma } from '@/lib/prisma';
import FormalBeritaAcaraForm from '../FormalBeritaAcaraForm';

export const metadata = {
  title: 'Berita Acara Serah Terima Formal',
};

export default async function FormalBeritaAcaraPage({ params }: { params: { id: string } }) {
  const agunan = await prisma.agunan.findUnique({
    where: { id: Number(params.id) },
    include: { 
      nasabah: true,
      registrasi: {
        include: {
          agunans: true
        }
      }
    },
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
      <h1>Berita Acara Serah Terima Formal</h1>
      <p>Formulir formal siap cetak dengan kop BPR, nomor dokumen, dan tanda tangan rapi.</p>
      <FormalBeritaAcaraForm agunan={agunan} />
    </main>
  );
}
