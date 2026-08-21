const fs = require('fs');

function patchFile(filepath) {
  let code = fs.readFileSync(filepath, 'utf8');

  // Change signature to accept searchParams
  code = code.replace(
    /export default async function [a-zA-Z]+\(\) \{/,
    match => match.replace("()", "({ searchParams }: { searchParams: { periodeId?: string } })")
  );

  const fetchPeriods = `
  const semuaPeriode = await prisma.periodeNominatif.findMany({
    where: { jenisUpload: filepath.includes('collecting') ? 'COLLECTING' : 'PERFORMA' },
    orderBy: [{ tahun: 'desc' }, { bulan: 'desc' }],
  });

  let periodeAktif = semuaPeriode[0];
  if (searchParams.periodeId) {
    const selected = semuaPeriode.find(p => p.id === parseInt(searchParams.periodeId));
    if (selected) periodeAktif = selected;
  }
  `;

  // For collecting page:
  if (filepath.includes('collecting')) {
    code = code.replace(
      /const periodeAktif = await prisma.periodeNominatif.findFirst\(\{[\s\S]*?\}\);/,
      fetchPeriods.replace("filepath.includes('collecting') ? 'COLLECTING' : 'PERFORMA'", "'COLLECTING'")
    );

    code = code.replace(
      /<div style=\{\{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' \}\}>/,
      `<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: 0 }}>Dashboard Collecting Kredit</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
              <span>Periode: <strong>{periodeAktif.bulan}/{periodeAktif.tahun}</strong></span>
              <form method="GET" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <select name="periodeId" className="inputField" defaultValue={periodeAktif.id} style={{ padding: '4px 8px', width: 'auto' }}>
                  {semuaPeriode.map(p => (
                    <option key={p.id} value={p.id}>{p.bulan}/{p.tahun}</option>
                  ))}
                </select>
                <button type="submit" className="button" style={{ padding: '6px 12px' }}>Tampilkan</button>
              </form>
            </div>
            <p style={{ marginTop: '8px', color: '#64748b' }}>Total {totalData} debitur (Data +1 Hari)</p>
          </div>
          <div style={{ display: 'none' }}>`
    );

    // cleanup old title block
    code = code.replace(/<h1>Dashboard Collecting Kredit<\/h1>\s*<p>.*?<\/p>/, "");
  }

  // For performa/kolektibilitas/page.tsx:
  if (filepath.includes('performa')) {
    code = code.replace(
      /const periodeAktif = await prisma.periodeNominatif.findFirst\(\{[\s\S]*?\}\);/,
      fetchPeriods.replace("filepath.includes('collecting') ? 'COLLECTING' : 'PERFORMA'", "'PERFORMA'")
    );

    code = code.replace(
      /<div style=\{\{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' \}\}>/,
      `<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: 0 }}>Laporan Kolektibilitas</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
              <span>Periode: <strong>{periodeAktif.bulan}/{periodeAktif.tahun}</strong></span>
              <form method="GET" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <select name="periodeId" className="inputField" defaultValue={periodeAktif.id} style={{ padding: '4px 8px', width: 'auto' }}>
                  {semuaPeriode.map(p => (
                    <option key={p.id} value={p.id}>{p.bulan}/{p.tahun}</option>
                  ))}
                </select>
                <button type="submit" className="button" style={{ padding: '6px 12px' }}>Tampilkan</button>
              </form>
            </div>
            <p style={{ marginTop: '8px', color: '#64748b' }}>Total {reportRows.length} debitur (Data +1 Hari)</p>
          </div>
          <div style={{ display: 'none' }}>`
    );
    // cleanup old title block
    code = code.replace(/<h1>Laporan Kolektibilitas<\/h1>\s*<p>.*?<\/p>/, "");
  }

  fs.writeFileSync(filepath, code);
}

patchFile('app/collecting/page.tsx');
patchFile('app/performa/kolektibilitas/page.tsx');
console.log('Periods patched');
