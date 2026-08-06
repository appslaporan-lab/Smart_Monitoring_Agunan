import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { determineEWS } from '@/lib/ews';
import { getKantorLabel, canAccessKantorData } from '@/lib/kantor';
import Link from 'next/link';

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
    include: { nasabah: true, kunjunganPenagihan: { orderBy: { createdAt: 'desc' }, take: 1 } },
    orderBy: { hariTunggakan: 'desc' },
  });

  const visiblePinjamans = pinjamans.filter((p) => {
    return canAccessKantorData(user.role, user.kantor, user.subKantor, p.subKantor);
  });

  const ewsData = visiblePinjamans.map((p) => ({
    ...p,
    ews: determineEWS(p.hariTunggakan, p.tglJatuhTempo),
  }));

  const summaryCounts = ewsData.reduce((acc, item) => {
    acc[item.ews.status] = (acc[item.ews.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const belumDikunjungi = ewsData.filter((item) => item.ews.wajibKunjungan && item.kunjunganPenagihan.length === 0);

  return (
    <main className="container">
      <section style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1>Dashboard Collecting Kredit</h1>
          <p>Periode: {periodeAktif.bulan}/{periodeAktif.tahun} — Total {pinjamans.length} debitur</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link href="/collecting/report" className="button secondary">Laporan Kolektibilitas</Link>
          {user.role === 'SUPERADMIN' && (
            <Link href="/collecting/upload" className="button secondary">Kelola Upload Nominatif</Link>
          )}
        </div>
      </section>

      <section className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: 24 }}>
        <div className="metric-card">
          <div className="metric-accent" style={{ background: '#fbbf24' }} />
          <div>
            <div className="metric-value">{summaryCounts['H7_DESK_CALL'] || 0}</div>
            <div className="metric-label">H-7 Desk Call</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-accent" style={{ background: '#fb923c' }} />
          <div>
            <div className="metric-value">{summaryCounts['KUNJUNGAN_MO'] || 0}</div>
            <div className="metric-label">Kunjungan MO</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-accent" style={{ background: '#f87171' }} />
          <div>
            <div className="metric-value">{(summaryCounts['SURAT_TAGIHAN_1'] || 0) + (summaryCounts['SURAT_TAGIHAN_2'] || 0) + (summaryCounts['SURAT_TAGIHAN_3'] || 0)}</div>
            <div className="metric-label">Surat Tagihan</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-accent" style={{ background: '#dc2626' }} />
          <div>
            <div className="metric-value">{(summaryCounts['SP_1'] || 0) + (summaryCounts['SP_2'] || 0) + (summaryCounts['SP_3'] || 0)}</div>
            <div className="metric-label">Surat Peringatan</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-accent" style={{ background: '#94a3b8' }} />
          <div>
            <div className="metric-value">{belumDikunjungi.length}</div>
            <div className="metric-label">Belum Dikunjungi</div>
          </div>
        </div>
      </section>

      <section className="card" style={{ padding: 24 }}>
        <h2>Daftar Debitur</h2>
        <div style={{ display: 'grid', gap: 14, marginTop: 16 }}>
          {ewsData.map((item) => (
            <article key={item.id} className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <strong>{item.namaNasabahExcel}</strong> — {item.norek}
                  <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#64748b' }}>
                    Kantor: {getKantorLabel(item.subKantor)} | Tunggakan: {item.hariTunggakan} hari | AO: {item.namaAO || '-'}
                  </p>
                  {item.ews.wajibKunjungan && item.kunjunganPenagihan.length === 0 && (
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#dc2626', fontWeight: 600 }}>Belum ada kunjungan tercatat bulan ini</p>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <span className={`status-pill ${item.ews.colorClass}`}>{item.ews.label}</span>
                  <Link href={`/collecting/pinjaman/${item.id}`} className="button secondary" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                    Detail / Catat Kunjungan
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}