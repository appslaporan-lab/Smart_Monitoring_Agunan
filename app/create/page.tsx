import { prisma } from '@/lib/prisma';
import CreateAgunanForm from './CreateAgunanForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Tambah Agunan Baru',
};

export default async function CreateAgunanPage() {
  const registrasis = await prisma.registrasi.findMany({
    where: { status: 'AKTIF' },
    include: { nasabah: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Tambah Data Agunan</h1>
        <p style={{ color: '#64748b', fontSize: '1.05rem', margin: 0 }}>Pilih Nomor Register Nasabah dan input detail agunan.</p>
      </div>

      <CreateAgunanForm registrasis={registrasis as any} />
    </div>
  );
}
