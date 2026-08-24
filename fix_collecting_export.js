const fs = require('fs');
let code = fs.readFileSync('app/collecting/CollectingDebiturList.tsx', 'utf8');

if (!code.includes('ExportExcelButton')) {
  code = code.replace("import Link from 'next/link';", "import Link from 'next/link';\nimport ExportExcelButton from '@/components/ExportExcelButton';");

  // Build excelData from filtered items
  const excelDataStr = `
  const excelData = filtered.map(item => ({
    'Nama Nasabah': item.namaNasabahExcel,
    'No Rekening': item.norek,
    'Kantor': item.kantorLabel,
    'Nama AO': item.namaAO,
    'Hari Tunggakan': item.hariTunggakan,
    'Status EWS': item.ews,
    'Kol Bulan Ini': item.kolBulanIni || '-',
    'Kol Bulan Lalu': item.kolBulanLalu || '-',
    'Jml Kunjungan': item.kunjunganCount
  }));
  `;

  // insert after filtered useMemo
  code = code.replace("const cardLabels: Record<string, string> = {", excelDataStr + "\n  const cardLabels: Record<string, string> = {");

  // insert button near the search input
  code = code.replace(
    `<input
            className="inputField"
            type="search"`,
    `<ExportExcelButton data={excelData} fileName="Collecting_Debitur" sheetName="Collecting" />
          <input
            className="inputField"
            type="search"`
  );
  
  // Also fix layout flex to accommodate both nicely
  code = code.replace(
    `<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>`,
    `<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>`
  );
}

fs.writeFileSync('app/collecting/CollectingDebiturList.tsx', code);
console.log('Export applied to Collecting');
