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
  });

  const periodeSebelumnya = await prisma.periodeNominatif.findFirst({
    where: { 
      jenisUpload: 'COLLECTING',
      id: { lt: periodeAktif.id } 
    },
    orderBy: { id: 'desc' }
  });

  let prevKolMap = new Map<string, string>();
  if (periodeSebelumnya) {
    const prevPinjamans = await prisma.pinjamanPeriode.findMany({
      where: { periodeId: periodeSebelumnya.id },
      select: { norek: true, kdKolektibilitas: true }
    });
    for (const pp of prevPinjamans) {
      if (pp.kdKolektibilitas) {
        prevKolMap.set(pp.norek, pp.kdKolektibilitas);
      }
    }
  }

  const visiblePinjamans = pinjamans.filter((p) => {
    return canAccessKantorData(user.role, user.kantor, user.subKantor, p.subKantor);
  });

  // Calculate dynamic days: days passed since the file was uploaded
  const now = new Date();
  const diffTime = now.getTime() - periodeAktif.createdAt.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const daysToAdd = Math.max(0, diffDays);

  const ewsData = visiblePinjamans.map((p) => {
    const dynamicHariTunggakan = p.hariTunggakan + daysToAdd;
    return {
      id: p.id,
      norek: p.norek,
      namaNasabahExcel: p.namaNasabahExcel,
      subKantor: p.subKantor,
      namaAO: p.namaAO,
      hariTunggakan: dynamicHariTunggakan,
      kantorLabel: getKantorLabel(p.subKantor),
      kunjunganCount: p.kunjunganPenagihan.length,
      ews: determineEWS(dynamicHariTunggakan, p.tglJatuhTempo),
      kolBulanIni: p.kdKolektibilitas,
      kolBulanLalu: prevKolMap.get(p.norek) || null,
    };
  }).sort((a, b) => b.hariTunggakan - a.hariTunggakan);

  return (
    <main className="container">
      <section style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1>Dashboard Collecting Kredit</h1>
          <p>Periode: {periodeAktif.bulan}/{periodeAktif.tahun} — Total {pinjamans.length} debitur (Data +{daysToAdd} Hari)</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {user.role === 'SUPERADMIN' && (
            <Link href="/collecting/upload" className="button secondary">Kelola Upload Nominatif</Link>
          )}
        </div>
      </section>

      <CollectingDebiturList items={ewsData as any} />
    </main>
  );
}