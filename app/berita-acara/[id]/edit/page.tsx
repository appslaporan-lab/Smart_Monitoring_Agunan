import { prisma } from '@/lib/prisma';
import EditBeritaAcaraForm from '@/app/berita-acara/EditBeritaAcaraForm';

export const metadata = {
  title: 'Edit Berita Acara',
};

export default async function EditPage({ params }: { params: { id: string } }) {
  const beritaAcara = await prisma.beritaAcara.findUnique({
    where: { id: Number(params.id) },
    include: { agunan: true },
  });

  if (!beritaAcara) {
    return (
      <main className="container" style={{ paddingTop: 24 }}>
        <h1>Berita acara tidak ditemukan</h1>
      </main>
    );
  }

  return (
    <main className="container" style={{ paddingTop: 24 }}>
      <h1>Edit Berita Acara</h1>
      <p>Perbarui data berita acara sebelum disimpan atau dicetak kembali.</p>
      <EditBeritaAcaraForm beritaAcara={beritaAcara} />
    </main>
  );
}
