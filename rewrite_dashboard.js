const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

const importsToAdd = `
import MasterDashboardCharts from './MasterDashboardCharts';
import { getKantorGroup } from '@/lib/kantor';
`;

code = code.replace("import AgunanStatusChart from './AgunanStatusChart';", "import AgunanStatusChart from './AgunanStatusChart';\n" + importsToAdd);

const newLogic = `
export default async function Home() {
  const agunans = await fetchAgunans();

  // --- NEW DASHBOARD DATA ---
  // Kolektibilitas
  const latestPeriode = await prisma.periodeNominatif.findFirst({ orderBy: { id: 'desc' } });
  let kolekStats = { byBranch: [] as any[] };
  if (latestPeriode) {
    const pinjamans = await prisma.pinjamanPeriode.findMany({
      where: { periodeId: latestPeriode.id },
      select: { kol: true, isNpl: true, outstanding: true, subKantor: true }
    });
    const grouped: any = {};
    for (const p of pinjamans) {
      const g = getKantorGroup(p.subKantor) || 'LAINNYA';
      const label = g.replace('_', ' ');
      if (!grouped[label]) grouped[label] = { branch: label, nonNpl: 0, npl: 0 };
      if (p.isNpl) grouped[label].npl += p.outstanding;
      else grouped[label].nonNpl += p.outstanding;
    }
    kolekStats.byBranch = Object.values(grouped).sort((a: any, b: any) => b.nonNpl - a.nonNpl);
  }

  // Collecting
  const collectingData = await prisma.kunjunganPenagihan.findMany({
    where: {
      tanggalKunjungan: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    },
    select: { hasil: true, tanggalKunjungan: true }
  });
  
  const collectGrouped: any = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dateStr = format(d, 'dd MMM');
    collectGrouped[dateStr] = { date: dateStr, BERHASIL: 0, JANJI_BAYAR: 0, GAGAL: 0 };
  }
  
  for (const c of collectingData) {
    const dateStr = format(new Date(c.tanggalKunjungan), 'dd MMM');
    if (!collectGrouped[dateStr]) continue;
    if (c.hasil === 'LUNAS' || c.hasil === 'ANGSURAN') collectGrouped[dateStr].BERHASIL++;
    else if (c.hasil === 'JANJI_BAYAR') collectGrouped[dateStr].JANJI_BAYAR++;
    else collectGrouped[dateStr].GAGAL++;
  }
  const collectingStats = Object.values(collectGrouped);

  // KPI (Mock Data since no model yet)
  const kpiStats = [
    { name: 'Sangat Baik', value: 12 },
    { name: 'Baik', value: 25 },
    { name: 'Cukup', value: 8 },
    { name: 'Kurang', value: 2 }
  ];
`;

code = code.replace("export default async function Home() {\n  const agunans = await fetchAgunans();", newLogic);

// Then we need to replace the header and inject the MasterDashboardCharts
const oldHeader = `
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
`;

const newHeader = `
    <main className="container">
      <header style={{ marginBottom: 32 }}>
        <h1>Dashboard Executive</h1>
        <p>Ringkasan performa kolektibilitas, penagihan, KPI, dan agunan.</p>
      </header>

      <MasterDashboardCharts 
        agunanProps={{
          totalCount: agunans.length,
          summaryStats,
          statusSegments: donutSegments,
          jenisCounts
        }}
        kolekStats={kolekStats}
        collectingStats={collectingStats}
        kpiStats={kpiStats}
      />

      <div style={{ marginTop: 40, marginBottom: 20 }}>
        <h2>Tindak Lanjut & Peringatan Agunan</h2>
      </div>

      <section className="grid" style={{ marginBottom: 32 }}>
`;

code = code.replace(oldHeader, newHeader);

fs.writeFileSync('app/page.tsx', code);
console.log('Dashboard rewritten');
