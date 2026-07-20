import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Laporan & Dashboard',
};

export default async function ReportsPage() {
  const agunans = await prisma.agunan.findMany({ include: { nasabah: true, registrasi: true } });
  const report = {
    summary: {
      total: agunans.length,
      diBrankas: agunans.filter((item) => item.status === 'DI_BRANKAS').length,
      prosesKeluar: agunans.filter((item) => item.status === 'PROSES_KELUAR').length,
      diserahkan: agunans.filter((item) => item.status === 'DISERAHKAN').length,
      her5Tahunan: agunans.filter((item) => item.status === 'HER_5_TAHUNAN').length,
      prosesSertifikasi: agunans.filter((item) => item.status === 'PROSES_SERTIFIKASI').length,
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
          <h2>Di Brankas</h2>
          <p style={{ fontSize: '1.6rem', fontWeight: 700 }}>{report.summary.diBrankas}</p>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <h2>Proses Keluar</h2>
          <p style={{ fontSize: '1.6rem', fontWeight: 700 }}>{report.summary.prosesKeluar}</p>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <h2>HER 5 Tahunan</h2>
          <p style={{ fontSize: '1.6rem', fontWeight: 700 }}>{report.summary.her5Tahunan}</p>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <h2>Proses Sertifikasi</h2>
          <p style={{ fontSize: '1.6rem', fontWeight: 700 }}>{report.summary.prosesSertifikasi}</p>
        </div>
      </section>
      <section className="card" style={{ padding: 24 }}>
        <h2>Rincian Agunan</h2>
        <ul>
          {report.agunans.map((item: any) => (
            <li key={item.id} style={{ marginBottom: 10 }}>
              <strong>{item.kodeRegister}</strong> — {item.nasabah?.nama || '-'} | Status: {item.status.replace(/_/g, ' ')} | No. Rekening: {item.registrasi?.nomorRekening ?? '-'}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}