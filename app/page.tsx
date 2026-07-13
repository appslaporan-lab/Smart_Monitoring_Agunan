import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { format } from 'date-fns';
import AgunanStatusChart from './AgunanStatusChart';

export const dynamic = 'force-dynamic';

type AgunanWithNasabah = Prisma.AgunanGetPayload<{ include: { nasabah: true } }>;

const fetchAgunans = async (): Promise<AgunanWithNasabah[]> => {
  return prisma.agunan.findMany({ include: { nasabah: true }, orderBy: { updatedAt: 'desc' } });
};

const formatDate = (date?: Date | string | null) => {
  if (!date) return '-';
  return format(new Date(date), 'dd MMM yyyy');
};

const statusClass = (status: string) => {
  switch (status) {
    case 'DIKELUARKAN':
      return 'status-dikeluarkan';
    case 'DISETUJUI_OPERASIONAL':
    case 'DISETUJUI_PIMPINAN':
    case 'DISETUJUI':
      return 'status-disetujui';
    case 'TRANSFER_CABANG':
    case 'RE_DISBURSE':
      return 'status-warning';
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

  const warnings = agunans.filter((item) => item.keluarDariBrankas && !item.diserahkanKeNasabah);
  const herWarnings = agunans.filter(
    (item) => item.jenis === 'BPKB' && item.her5Reminder && new Date(item.her5Reminder) <= new Date(),
  );

  const statusCounts = agunans.reduce(
    (acc, item) => {
      if (item.status === 'DIKELUARKAN') acc.dikeluarkan += 1;
      else if (item.status.includes('DISETUJUI')) acc.disetujui += 1;
      else if (item.status === 'DISERAHKAN') acc.diserahkan += 1;
      else if (item.status === 'KEMBALI') acc.kembali += 1;
      else acc.lainnya += 1;
      return acc;
    },
    { dikeluarkan: 0, disetujui: 0, diserahkan: 0, kembali: 0, lainnya: 0 },
  );

  const totalStatusCount = agunans.length || 1;
  const statusChartData = [
    { label: 'Dikeluarkan', count: statusCounts.dikeluarkan, className: 'status-chart-dikeluarkan' },
    { label: 'Disetujui', count: statusCounts.disetujui, className: 'status-chart-disetujui' },
    { label: 'Diserahkan', count: statusCounts.diserahkan, className: 'status-chart-diserahkan' },
    { label: 'Kembali', count: statusCounts.kembali, className: 'status-chart-kembali' },
    { label: 'Lainnya', count: statusCounts.lainnya, className: 'status-chart-lainnya' },
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
    { label: 'Dikeluarkan', value: statusCounts.dikeluarkan, accent: 'status-chart-dikeluarkan' },
    { label: 'Disetujui', value: statusCounts.disetujui, accent: 'status-chart-disetujui' },
    { label: 'Diserahkan', value: statusCounts.diserahkan, accent: 'status-chart-diserahkan' },
  ];

  const jenisCounts = Object.entries(
    agunans.reduce((acc, item) => {
      acc[item.jenis] = (acc[item.jenis] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  )
    .map(([jenis, count]) => ({
      jenis,
      count,
      percent: Math.round((count / totalStatusCount) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <main className="container">
      <header style={{ marginBottom: 32 }}>
        <h1>Monitoring Agunan</h1>
        <p>Aplikasi untuk memonitor pengecualian agunan, penyerahan, dan HER BPKB.</p>
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
          <h2>Peringatan Agunan Keluar</h2>
          {warnings.length === 0 ? (
            <p>Tidak ada agunan yang keluar dan belum diserahkan.</p>
          ) : (
            <ul>
              {warnings.map((item) => (
                <li key={item.id}>
                  {item.kodeRegister} ({item.jenis}) - {item.nasabah.nama}, keluar: {formatDate(item.tanggalKeluar)}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h2>Peringatan BPKB HER 5 Tahunan</h2>
          {herWarnings.length === 0 ? (
            <p>Tidak ada BPKB yang harus diambil ke Samsat sekarang.</p>
          ) : (
            <ul>
              {herWarnings.map((item) => (
                <li key={item.id}>
                  {item.kodeRegister} - {item.nasabah.nama}, batas waktu: {formatDate(item.her5Reminder)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h2>Daftar Agunan</h2>
            <p>Semua agunan dan status penyerahan.</p>
          </div>
          <Link href="/create" className="button">
            Tambah Agunan
          </Link>
        </div>

        <div style={{ display: 'grid', gap: 18, marginTop: 24 }}>
          {agunans.length === 0 ? (
            <p>Belum ada agunan terdaftar.</p>
          ) : (
            agunans.map((item) => (
              <article key={item.id} className="card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <strong>{item.kodeRegister}</strong>
                    <p>{item.jenis} — {item.deskripsi}</p>
                    <p>Nasabah: {item.nasabah.nama}</p>
                  </div>
                  <span className={`status-pill ${statusClass(item.status)}`}>{item.status.replace(/_/g, ' ')}</span>
                </div>
                <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
                  <p>Keluar dari brankas: {item.keluarDariBrankas ? 'Ya' : 'Tidak'}</p>
                  <p>Diserahkan ke nasabah: {item.diserahkanKeNasabah ? 'Ya' : 'Tidak'}</p>
                  <p>Keluar oleh: {item.keluarOleh ?? '-'}</p>
                  <p>Diserahkan oleh: {item.diserahkanOleh ?? '-'}</p>
                  <p>Tanggal keluar: {formatDate(item.tanggalKeluar)}</p>
                  <p>Tanggal serah: {formatDate(item.tanggalSerah)}</p>
                  <p>HER 5 reminder: {formatDate(item.her5Reminder)}</p>
                </div>
                <Link href={`/agunan/${item.id}`} className="button secondary" style={{ marginTop: 14 }}>
                  Detail Agunan
                </Link>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
