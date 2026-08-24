const fs = require('fs');
let code = fs.readFileSync('app/kpi/mo-realisasi/page.tsx', 'utf8');

// Imports
if (!code.includes('ExportExcelButton')) {
  code = code.replace("import EmptyState from '@/components/EmptyState';", "import EmptyState from '@/components/EmptyState';\nimport ExportExcelButton from '@/components/ExportExcelButton';\nimport TableSearch from '@/components/TableSearch';");
}

// Generate Excel Data for MO Ranking
if (!code.includes('excelDataRanking')) {
  const table1Header = `<div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>`;
  
  const table1Replacement = `
  const excelDataRanking = rankingArray.map((mo, idx) => ({
    'Rank': idx + 1,
    'Nama MO': mo.nama,
    'Kantor Kas': mo.subKantor,
    'Jml Nasabah': mo.count,
    'Nominal Realisasi': mo.total,
    'Target MO': TARGET_MO,
    'Selisih': mo.total - TARGET_MO,
    'Status': mo.total >= TARGET_MO ? 'Lulus Target' : 'Belum Lulus'
  }));

  const excelDataRecon = Object.entries(rekonStats).map(([sk, data]) => ({
    'Kantor Kas': sk,
    'Total Input MO': data.moTotal,
    'Total Laporan Teller': data.tellerTotal,
    'Selisih': data.moTotal - data.tellerTotal,
    'Status': data.moTotal === data.tellerTotal ? 'Cocok' : 'Selisih'
  }));

  return (`;

  code = code.replace("return (", table1Replacement);
  
  // Add ID to tables and UI components
  // Ranking Table
  code = code.replace(
    `<h2 style={{ margin: 0 }}>Ranking MO (Bulan {bulan}/{tahun})</h2>\n        </div>`,
    `<h2 style={{ margin: 0 }}>Ranking MO (Bulan {bulan}/{tahun})</h2>\n        </div>\n        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>\n          <TableSearch tableId="table-ranking-mo" placeholder="Cari nama MO atau kantor..." />\n          <ExportExcelButton data={excelDataRanking} fileName={\`Ranking_MO_\${bulan}_\${tahun}\`} sheetName="Ranking" />\n        </div>`
  );
  code = code.replace(`<table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>`, `<table id="table-ranking-mo" className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>`);

  // Recon Table
  code = code.replace(
    `<h2 style={{ margin: 0 }}>Rekonsiliasi per Kantor (Bulan {bulan}/{tahun})</h2>\n        </div>`,
    `<h2 style={{ margin: 0 }}>Rekonsiliasi per Kantor (Bulan {bulan}/{tahun})</h2>\n        </div>\n        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>\n          <TableSearch tableId="table-recon-mo" placeholder="Cari kantor kas..." />\n          <ExportExcelButton data={excelDataRecon} fileName={\`Rekonsiliasi_MO_\${bulan}_\${tahun}\`} sheetName="Rekonsiliasi" />\n        </div>`
  );
  code = code.replace(`className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>`, `id="table-recon-mo" className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>`);
}

fs.writeFileSync('app/kpi/mo-realisasi/page.tsx', code);
console.log('MO Page Phase 2 Updated');
