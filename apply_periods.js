const fs = require('fs');

// --- COLLECTING DASHBOARD ---
let codeCol = fs.readFileSync('app/collecting/page.tsx', 'utf8');
codeCol = codeCol.replace(
  /export default async function CollectingDashboardPage\(\) \{/,
  "export default async function CollectingDashboardPage({ searchParams }: { searchParams: { periodeId?: string } }) {"
);
const fetchCol = `
  const semuaPeriode = await prisma.periodeNominatif.findMany({
    where: { jenisUpload: 'COLLECTING' },
    orderBy: [{ tahun: 'desc' }, { bulan: 'desc' }],
  });

  let periodeAktif = semuaPeriode[0];
  if (searchParams.periodeId) {
    const selected = semuaPeriode.find(p => p.id === parseInt(searchParams.periodeId));
    if (selected) periodeAktif = selected;
  }
`;
codeCol = codeCol.replace(
  /const periodeAktif = await prisma\.periodeNominatif\.findFirst\(\{[\s\S]*?\}\);/,
  fetchCol
);
codeCol = codeCol.replace(
  /<section style=\{\{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 \}\}>[\s\S]*?<\/section>/,
  `<section style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
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
          <p style={{ marginTop: 8 }}>Total {pinjamans.length} debitur (Data +{daysToAdd} Hari)</p>
        </div>
        {user.role === 'SUPERADMIN' && (
          <Link href="/collecting/upload" className="button secondary">Kelola Upload Nominatif</Link>
        )}
      </section>`
);
fs.writeFileSync('app/collecting/page.tsx', codeCol);

// --- PERFORMA DASHBOARD ---
let codePerf = fs.readFileSync('app/performa/kolektibilitas/page.tsx', 'utf8');
codePerf = codePerf.replace(
  /export default async function PerformaKolektibilitasPage\(\) \{/,
  "export default async function PerformaKolektibilitasPage({ searchParams }: { searchParams: { periodeId?: string } }) {"
);
const fetchPerf = `
  const semuaPeriode = await prisma.periodeNominatif.findMany({
    where: { jenisUpload: 'PERFORMA' },
    orderBy: [{ tahun: 'desc' }, { bulan: 'desc' }],
  });

  let periodeAktif = semuaPeriode[0];
  if (searchParams.periodeId) {
    const selected = semuaPeriode.find(p => p.id === parseInt(searchParams.periodeId));
    if (selected) periodeAktif = selected;
  }
`;
codePerf = codePerf.replace(
  /const periodeAktif = await prisma\.periodeNominatif\.findFirst\(\{[\s\S]*?\}\);/,
  fetchPerf
);
codePerf = codePerf.replace(
  /<section style=\{\{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' \}\}>[\s\S]*?<\/section>/,
  `<section style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ marginBottom: 8 }}>LAPORAN PERFORM KOLEKTIBILITY</h1>
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
        </div>
        <div>
          <Link href="/admin/upload-nominatif?type=performa" className="button secondary">Kelola Data Laporan</Link>
        </div>
      </section>`
);
fs.writeFileSync('app/performa/kolektibilitas/page.tsx', codePerf);

console.log('Periods rewritten correctly');
