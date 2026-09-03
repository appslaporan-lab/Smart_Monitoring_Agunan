import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { determineEWS } from '@/lib/ews';
import { getKantorLabel, canAccessKantorData } from '@/lib/kantor';
import Link from 'next/link';
import EmptyState from '@/components/EmptyState';
import CollectingDebiturList from './CollectingDebiturList';

export const dynamic = 'force-dynamic';

export default async function CollectingDashboardPage({ searchParams }: { searchParams: { periodeId?: string } }) {
  const user = getCurrentUser();
  if (!user) redirect('/auth/login');

  
  const semuaPeriode = await prisma.periodeNominatif.findMany({
    where: { jenisUpload: 'COLLECTING' },
    orderBy: [{ tahun: 'desc' }, { bulan: 'desc' }],
  });

  let periodeAktif = semuaPeriode[0];
  if (searchParams.periodeId) {
    const selected = semuaPeriode.find(p => p.id === parseInt(searchParams.periodeId as string));
    if (selected) periodeAktif = selected;
  }


  if (!periodeAktif) {
    return (
      <main className="container">
        <section style={{ marginBottom: 32 }}>
          <h1>Dashboard Collecting Kredit</h1>
        </section>
        <EmptyState 
          title="Belum ada data nominatif" 
          description="Silakan upload data nominatif collecting terlebih dahulu untuk melihat dashboard pemantauan debitur."
          actionLabel={user.role === 'SUPERADMIN' ? "Upload Nominatif Sekarang" : undefined}
          actionHref={user.role === 'SUPERADMIN' ? "/collecting/upload" : undefined}
        />
      </main>
    );
  }

  const pinjamans = await prisma.pinjamanPeriode.findMany({
    where: { periodeId: periodeAktif.id },
    include: { nasabah: true, kunjunganPenagihan: { orderBy: { createdAt: 'desc' } } },
  });

  const allUsers = await prisma.user.findMany({ select: { id: true, nama: true } });
  const userMap = new Map(allUsers.map(u => [u.id, u.nama]));

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
    prevPinjamans.forEach(p => {
      if (p.kdKolektibilitas) {
        prevKolMap.set(p.norek, p.kdKolektibilitas);
      }
    });
  }

  const visiblePinjamans = pinjamans.filter((p) => {
    return canAccessKantorData(user.role, user.kantor, user.subKantor, p.subKantor);
  });

  const now = new Date();
  now.setHours(0,0,0,0);
  const uploadDate = new Date(periodeAktif.createdAt);
  uploadDate.setHours(0,0,0,0);
  const diffTime = now.getTime() - uploadDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const daysToAdd = Math.max(0, diffDays);

  const ewsData = visiblePinjamans.map((p) => {
    const dynamicHariTunggakan = (() => {
      if (p.isLunas || p.sudahBayar) return p.hariTunggakan;
      if (p.hariTunggakan === 0) return 0;
      return daysToAdd > 0 ? p.hariTunggakan + daysToAdd : p.hariTunggakan;
    })();

    let tglJanji: Date | null = null;
    let janjiPetugas: string | null = null;
    let janjiCatatan: string | null = null;

    if (p.kunjunganPenagihan && p.kunjunganPenagihan.length > 0) {
      const janji = p.kunjunganPenagihan.filter((k: any) => k.hasil === 'JANJI_BAYAR' && k.tanggalJanjiBayar);
      if (janji.length > 0) {
        janji.sort((a: any, b: any) => new Date(b.tanggalKunjungan).getTime() - new Date(a.tanggalKunjungan).getTime());
        tglJanji = janji[0].tanggalJanjiBayar;
        janjiPetugas = userMap.get(janji[0].petugasId) || null;
        janjiCatatan = janji[0].catatan;
      }
    }

    return {
      id: p.id,
      norek: p.norek,
      namaNasabahExcel: p.namaNasabahExcel,
      subKantor: p.subKantor,
      namaAO: p.namaAO,
      hariTunggakan: dynamicHariTunggakan,
      kantorLabel: getKantorLabel(p.subKantor),
      kunjunganCount: p.kunjunganPenagihan.length,
      ews: determineEWS(dynamicHariTunggakan, p.tglJatuhTempo, p.tglRealisasi, tglJanji),
      kolBulanIni: p.kdKolektibilitas,
      kolBulanLalu: prevKolMap.get(p.norek) || null,
      sudahBayar: p.sudahBayar,
      isLunas: p.isLunas,
      nominalBayarHariIni: p.nominalBayarHariIni,
      norekTabungan: p.norekTabungan,
      saldoTabungan: p.saldoTabungan,
      tunggakanPokok: p.tunggakanPokok,
      tunggakanBunga: p.tunggakanBunga,
      lastKunjungan: p.kunjunganPenagihan && p.kunjunganPenagihan.length > 0 ? {
        tanggalKunjungan: p.kunjunganPenagihan[0].tanggalKunjungan,
        hasil: p.kunjunganPenagihan[0].hasil,
        tanggalJanjiBayar: tglJanji || p.kunjunganPenagihan[0].tanggalJanjiBayar,
        catatan: p.kunjunganPenagihan[0].hasil === 'JANJI_BAYAR' ? p.kunjunganPenagihan[0].catatan : (janjiCatatan || p.kunjunganPenagihan[0].catatan),
        petugasNama: p.kunjunganPenagihan[0].hasil === 'JANJI_BAYAR' ? (userMap.get(p.kunjunganPenagihan[0].petugasId) || 'Petugas') : (janjiPetugas || userMap.get(p.kunjunganPenagihan[0].petugasId) || 'Petugas')
      } : null,
    };
  }).sort((a, b) => b.hariTunggakan - a.hariTunggakan);

  return (
    <main className="container">
      <section style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ marginBottom: 8 }}>Dashboard Collecting Kredit</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>Periode:</span>
            <form method="GET" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <select name="periodeId" className="inputField" defaultValue={periodeAktif.id} style={{ padding: '4px 8px', width: 'auto' }}>
                {semuaPeriode.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.bulan}/{p.tahun}</option>
                ))}
              </select>
              <button type="submit" className="button" style={{ padding: '6px 12px' }}>Tampilkan</button>
            </form>
          </div>
          <p style={{ marginTop: 8 }}>Total {visiblePinjamans.length} debitur (Data +{daysToAdd} Hari)</p>
        </div>
        {user.role === 'SUPERADMIN' && (
          <Link href="/collecting/upload" className="button secondary">Kelola Upload Nominatif</Link>
        )}
      </section>

      <CollectingDebiturList items={ewsData as any} />
    </main>
  );
}