import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Laporan & Dashboard',
};

export default async function ReportsPage() {
  const agunans = await prisma.agunan.findMany({ include: { nasabah: true } });
  const report = {
    summary: {
      total: agunans.length,
      pending: agunans.filter((item) => item.status === 'PENDING').length,
      dikeluarkan: agunans.filter((item) => item.status === 'DIKELUARKAN').length,
      diserahkan: agunans.filter((item) => item.status === 'DISERAHKAN').length,
      keluarBelumSerah: agunans.filter((item) => item.keluarDariBrankas && !item.diserahkanKeNasabah).length,
      her5Tahun: agunans.filter((item) => item.jenis === 'BPKB' && item.her5Reminder && new Date(item.her5Reminder) <= new Date()).length,
    },
    agunans,
  };

  return (
    <main className="container" style={{ paddingTop: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1>Laporan & Dashboard</h1>
          <p>Ringkasan status agunan, penyerahan, dan reminder HER.</p>
        </div>
        <Link href="/audit" className="button secondary">Lihat Audit Trail</Link>
      </div>

      <section className="grid" style={{ marginTop: 24, marginBottom: 24 }}>
        <div className="card" style={{ padding: 18 }}>
          <h2>Total Agunan</h2>
          <p style={{ fontSize: '1.6rem', fontWeight: 700 }}>{report.summary.total}</p>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <h2>Pending</h2>
          <p style={{ fontSize: '1.6rem', fontWeight: 700 }}>{report.summary.pending}</p>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <h2>Keluar Belum Serah</h2>
          <p style={{ fontSize: '1.6rem', fontWeight: 700 }}>{report.summary.keluarBelumSerah}</p>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <h2>HER 5 Tahun</h2>
          <p style={{ fontSize: '1.6rem', fontWeight: 700 }}>{report.summary.her5Tahun}</p>
        </div>
      </section>

      <section className="card" style={{ padding: 24 }}>
        <h2>Rincian Agunan</h2>
        <ul>
          {report.agunans.map((item: any) => (
            <li key={item.id} style={{ marginBottom: 10 }}>
              <strong>{item.kodeRegister}</strong> — {item.nasabah?.nama || '-'} | Status: {item.status} | Keluar: {item.keluarDariBrankas ? 'Ya' : 'Tidak'} | Diserahkan: {item.diserahkanKeNasabah ? 'Ya' : 'Tidak'}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
