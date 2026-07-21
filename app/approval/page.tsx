import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import ApprovalList from './ApprovalList';
import { JENIS_LABEL } from '@/lib/pengajuan';

export const dynamic = 'force-dynamic';

export default async function ApprovalPage() {
  const user = getCurrentUser();
  if (!user) redirect('/auth/login');

  const pengajuans = await prisma.pengajuanKeluar.findMany({
    where: { status: 'MENUNGGU' },
    include: {
      agunan: { include: { nasabah: true } },
      diajukanOleh: true,
      steps: { orderBy: { urutan: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const myTasks = pengajuans.filter((p) => {
    const currentStep = p.steps.find((s) => s.status === 'MENUNGGU');
    if (!currentStep) return false;
    return currentStep.rolesDiizinkan.split(',').includes(user.role);
  });

  return (
    <main className="container">
      <section style={{ marginBottom: 32 }}>
        <h1>Approval Pengajuan Keluar</h1>
        <p>Daftar pengajuan yang menunggu persetujuan Anda.</p>
      </section>
      <div className="card" style={{ padding: 24 }}>
        {myTasks.length === 0 ? (
          <p>Tidak ada pengajuan yang menunggu persetujuan Anda.</p>
        ) : (
          <ApprovalList
            items={myTasks.map((p) => ({
              id: p.id,
              kodeRegister: p.agunan.kodeRegister,
              jenis: p.agunan.jenis,
              namaNasabah: p.agunan.nasabah.nama,
              jenisPengajuanLabel: JENIS_LABEL[p.jenisPengajuan] || p.jenisPengajuan,
              diajukanOleh: p.diajukanOleh.nama,
              catatan: p.catatan,
              langkahSaatIni: p.steps.find((s) => s.status === 'MENUNGGU')?.urutan || 1,
              totalLangkah: p.steps.length,
            }))}
          />
        )}
      </div>
    </main>
  );
}