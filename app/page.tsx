import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { format, differenceInDays } from 'date-fns';
import AgunanStatusChart from './AgunanStatusChart';

export const dynamic = 'force-dynamic';

type AgunanWithNasabah = Prisma.AgunanGetPayload<{ include: { nasabah: true; registrasi: true } }>;

const fetchAgunans = async (): Promise<AgunanWithNasabah[]> => {
  return prisma.agunan.findMany({ include: { nasabah: true, registrasi: true }, orderBy: { updatedAt: 'desc' } });
};

const formatDate = (date?: Date | string | null) => {
  if (!date) return '-';
  return format(new Date(date), 'dd MMM yyyy');
};

const hitungHari = (date?: Date | string | null) => {
  if (!date) return null;
  return differenceInDays(new Date(), new Date(date));
};

const statusClass = (status: string) => {
  switch (status) {
    case 'DI_BRANKAS':
      return 'status-pending';
    case 'PROSES_KELUAR':
      return 'status-warning';
    case 'HER_5_TAHUNAN':
      return 'status-warning';
    case 'PROSES_SERTIFIKASI':
      return 'status-warning';
    case 'TRANSFER_CABANG':
      return 'status-dikeluarkan';
    case 'PENCAIRAN_ULANG':
      return 'status-disetujui';
    case 'DISERAHKAN':
      return 'status-diserahkan';
    case 'KEMBALI':
      return 'status-kembali';
    default:
      return 'status-pending';
  }
};

export default async function Home() {
  const agunans = await fetchAgunans();

  const warnings = agunans.filter((item) => item.status === 'PROSES_KELUAR');
  const herWarnings = agunans.filter((item) => item.status === 'HER_5_TAHUNAN');
  const sertifikasiWarnings = agunans.filter(
    (item) => item.status === 'PROSES_SERTIFIKASI' && item.perkiraanJadiSHM && new Date(item.perkiraanJadiSHM) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  );

  const statusCounts = agunans.reduce(
    (acc, item) => {
      if (item.status === 'DI_BRANKAS') acc.diBrankas += 1;
      else if (item.status === 'PROSES_KELUAR') acc.prosesKeluar += 1;
      else if (item.status === 'DISERAHKAN') acc.diserahkan += 1;
      else if (item.status === 'HER_5_TAHUNAN' || item.status === 'PROSES_SERTIFIKASI') acc.proses += 1;
      else acc.lainnya += 1;
      return acc;
    },
    { diBrankas: 0, prosesKeluar: 0, diserahkan: 0, proses: 0, lainnya: 0 },
  );

  const totalStatusCount = agunans.length || 1;
  const statusChartData = [
    { label: 'Di Brankas', count: statusCounts.diBrankas, className: 'status-chart-lainnya' },
    { label: 'Proses Keluar', count: statusCounts.prosesKeluar, className: 'status-chart-dikeluarkan' },
    { label: 'Diserahkan', count: statusCounts.diserahkan, className: 'status-chart-diserahkan' },
    { label: 'HER/Sertifikasi', count: statusCounts.proses, className: 'status-chart-disetujui' },
    { label: 'Lainnya', count: statusCounts.lainnya, className: 'status-chart-kembali' },
  ];

  const donutRadius = 72;
  const donutCircumference = 2 * Math.PI * donutRadius;
  let donutOffset = 0;
  const donutSegments = statusChartData.map((status) => {
    const segmentLength = (status.count / totalStatusCount) * donutCircumference;
    const result = {
      ...status,
      segmentLength,
      offset: donutOffset,
      percent: totalStatusCount ? Math.round((status.count / totalStatusCount) * 100) : 0,
    };
    donutOffset += segmentLength;
    return result;
  });

  const summaryStats = [
    { label: 'Total Agunan', value: agunans.length, accent: 'status-chart-lainnya' },
    { label: 'Di Brankas', value: statusCounts.diBrankas, accent: 'status-chart-dikeluarkan' },
    { label: 'Proses Keluar', value: statusCounts.prosesKeluar, accent: 'status-chart-disetujui' },
    { label: 'Diserahkan', value: statusCounts.diserahkan, accent: 'status-chart-diserahkan' },
  ];

  const jenisCounts = Object.entries(
    agunans.reduce((acc, item) => {
      acc[item.jenis] = (acc[item.jenis] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  )
    .map(([jenis, count]) => ({ jenis, count, percent: Math.round((count / totalStatusCount) * 100) }))
    .sort((a, b) => b.count - a.count);

  return (
    <main className="container">
      <header style={{ marginBottom: 32 }}>
        <h1>Monitoring Agunan</h1>
        <p>Aplikasi untuk memonitor agunan, HER BPKB, dan proses sertifikasi.</p>
      </header>

      <section className="grid" style={{ marginBottom: 32 }}>
        <div className="card chart-card" style={{ padding: 24 }}>
          <AgunanStatusChart
            totalCount={agunans.length}
            summaryStats={summaryStats}
            statusSegments={donutSegments}
            jenisCounts={jenisCounts}
          />
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h2>Agunan Dalam Proses Keluar</h2>
          {warnings.length === 0 ? (
            <p>Tidak ada agunan yang sedang dalam proses keluar.</p>
          ) : (
            <ul>
              {warnings.map((item) => {
                const hari = hitungHari(item.tanggalKeluarBrankas);
                return (
                  <li key={item.id}>
                    {item.kodeRegister} ({item.jenis}) - {item.nasabah.nama}
                    {hari !== null && <strong> — sudah {hari} hari</strong>}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h2>Peringatan HER 5 Tahunan</h2>
          {herWarnings.length === 0 ? (
            <p>Tidak ada BPKB dalam proses HER 5 Tahunan.</p>
          ) : (
            <ul>
              {herWarnings.map((item) => {
                const hari = hitungHari(item.tanggalKeluarBrankas);
                return (
                  <li key={item.id}>
                    {item.kodeRegister} - {item.nasabah.nama} (STNK sementara, tunggu BPKB baru ~3 bulan)
                    {hari !== null && <strong> — sudah {hari} hari</strong>}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h2>Peringatan Proses Sertifikasi</h2>
          {sertifikasiWarnings.length === 0 ? (
            <p>Tidak ada proses sertifikasi yang mendekati jatuh tempo.</p>
          ) : (
            <ul>
              {sertifikasiWarnings.map((item) => {
                const hari = hitungHari(item.tanggalTerbitCovernote || item.createdAt);
                return (
                  <li key={item.id}>
                    {item.kodeRegister} - {item.nasabah.nama}, perkiraan jadi: {formatDate(item.perkiraanJadiSHM)}
                    {hari !== null && <strong> — sudah proses {hari} hari</strong>}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <section className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h2>Daftar Agunan</h2>
            <p>Semua agunan dan statusnya.</p>
          </div>
          <Link href="/create" className="button">Tambah Agunan</Link>
        </div>

        <div style={{ display: 'grid', gap: 18, marginTop: 24 }}>
          {agunans.length === 0 ? (
            <p>Belum ada agunan terdaftar.</p>
          ) : (
            agunans.map((item) => {
              const hariKeluar = (item.status === 'PROSES_KELUAR' || item.status === 'HER_5_TAHUNAN') ? hitungHari(item.tanggalKeluarBrankas) : null;
              const hariSertifikasi = item.status === 'PROSES_SERTIFIKASI' ? hitungHari(item.tanggalTerbitCovernote || item.createdAt) : null;
              return (
                <article key={item.id} className="card" style={{ padding: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                    <div>
                      <strong>{item.kodeRegister}</strong>
                      <p>{item.jenis} — {item.deskripsi || '-'}</p>
                      <p>Nasabah: {item.nasabah.nama}</p>
                      <p>No. Rekening: {item.registrasi?.nomorRekening ?? '-'}</p>
                      {hariKeluar !== null && <p style={{ color: '#dc2626', fontWeight: 600 }}>Sudah keluar brankas {hariKeluar} hari</p>}
                      {hariSertifikasi !== null && <p style={{ color: '#dc2626', fontWeight: 600 }}>Proses sertifikasi {hariSertifikasi} hari</p>}
		      {item.status === 'DISERAHKAN' && (
                        <p style={{ color: '#16a34a', fontWeight: 600 }}>Tanggal Diserahkan: {formatDate(item.updatedAt)}</p>
                      )}
                    </div>
                    <span className={`status-pill ${statusClass(item.status)}`}>{item.status.replace(/_/g, ' ')}</span>
                  </div>
                  <Link href={`/agunan/${item.id}`} className="button secondary" style={{ marginTop: 14 }}>
                    Detail Agunan
                  </Link>
                </article>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}