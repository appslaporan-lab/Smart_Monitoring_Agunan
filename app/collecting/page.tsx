import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { determineEWS } from '@/lib/ews';
import { getKantorLabel, canAccessKantorData } from '@/lib/kantor';
import Link from 'next/link';
import CollectingDebiturList from './CollectingDebiturList';

export const dynamic = 'force-dynamic';

export default async function CollectingDashboardPage() {
  const user = getCurrentUser();
  if (!user) redirect('/auth/login');

  const periodeAktif = await prisma.periodeNominatif.findFirst({
    where: { jenisUpload: 'COLLECTING' },
    orderBy: [{ tahun: 'desc' }, { bulan: 'desc' }],
  });

  if (!periodeAktif) {
    return (
      <main className="container">
        <section style={{ marginBottom: 32 }}>
          <h1>Dashboard Collecting Kredit</h1>
          <p>Belum ada data nominatif yang diupload.</p>
        </section>
        {user.role === 'SUPERADMIN' && (
          <Link href="/collecting/upload" className="button">Upload Nominatif Sekarang</Link>
        )}
      </main>
    );
  }

  const pinjamans = await prisma.pinjamanPeriode.findMany({
    where: { periodeId: periodeAktif.id },
    include: { nasabah: true, kunjunganPenagihan: { orderBy: { createdAt: 'desc' } } },
    orderBy: { hariTunggakan: 'desc' },
  });

  const visiblePinjamans = pinjamans.filter((p) => {
    return canAccessKantorData(user.role, user.kantor, user.subKantor, p.subKantor);
  });

  const ewsData = visiblePinjamans.map((p) => ({
    id: p.id,
    norek: p.norek,
    namaNasabahExcel: p.namaNasabahExcel,
    subKantor: p.subKantor,
    namaAO: p.namaAO,
    hariTunggakan: p.hariTunggakan,
    kantorLabel: getKantorLabel(p.subKantor),
    kunjunganCount: p.kunjunganPenagihan.length,
    ews: determineEWS(p.hariTunggakan, p.tglJatuhTempo),
  }));

  return (
    <main className="container">
      <section style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1>Dashboard Collecting Kredit</h1>
          <p>Periode: {periodeAktif.bulan}/{periodeAktif.tahun} — Total {pinjamans.length} debitur</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {user.role === 'SUPERADMIN' && (
            <Link href="/collecting/upload" className="button secondary">Kelola Upload Nominatif</Link>
          )}
        </div>
      </section>

      <CollectingDebiturList items={ewsData} />
    </main>
  );
}