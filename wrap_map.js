const fs = require('fs');

let code = fs.readFileSync('app/performa/kolektibilitas/page.tsx', 'utf8');

const oldMap = `const reportRows = rows.map((row) => {`;
const newMap = `const mapToReportRows = (dataRows: any[]) => dataRows.map((row: any) => {`;

if (code.includes(oldMap)) {
  code = code.replace(oldMap, newMap);
  
  const oldEnd = `return {
        subKantor: subKantorClean,
        kantorGroup: kGroup,
        
        kol: kolStr,
        isNpl: COLLECTING_REPORT_CONFIG.nplCodes.includes(kolStr.toUpperCase()),
        outstanding: row.outstanding ?? 0,
        moName: (() => {
          let raw = '';
          if (row.rawDataJson) {
            const parsed = JSON.parse(row.rawDataJson);
            raw = String(parsed['AQ'] || '').trim();
            if (!raw) {
              const kantor = String(parsed['E'] || '').trim();
              const sub = String(parsed['F'] || '').trim();
              const subKantorGabungan = [kantor, sub].filter(Boolean).join(' - ') || null;
              raw = subKantorGabungan || 'KANTOR TIDAK DIKETAHUI';
            }
          } else {
            raw = row.namaAO || '(blank)';
          }
          return (aoMap.get(raw) || raw).toUpperCase();
        })(),
        productBucket: (row.produkKredit?.trim() === '19.3' ? 'Kredit Sindikasi' : row.produkKredit) || '(blank)',
        sektorBucket: row.sektorEkonomi || 'LAIN-LAIN',
        interestRateBucket: classifyByRange(row.sukuBunga, bungaPdfRanges),
        tenorBucket: classifyByRange(row.jangkaBulan, tenorPdfRanges),
        plafondBucket: classifyByRange(row.plafon, plafondPdfRanges),
        agunanBucket: row.agunanJenis || 'TIDAK DIKETAHUI'
      };
    });`;

  const newEnd = `return {
        subKantor: subKantorClean,
        kantorGroup: kGroup,
        
        kol: kolStr,
        isNpl: COLLECTING_REPORT_CONFIG.nplCodes.includes(kolStr.toUpperCase()),
        outstanding: row.outstanding ?? 0,
        moName: (() => {
          let raw = '';
          if (row.rawDataJson) {
            const parsed = JSON.parse(row.rawDataJson);
            raw = String(parsed['AQ'] || '').trim();
            if (!raw) {
              const kantor = String(parsed['E'] || '').trim();
              const sub = String(parsed['F'] || '').trim();
              const subKantorGabungan = [kantor, sub].filter(Boolean).join(' - ') || null;
              raw = subKantorGabungan || 'KANTOR TIDAK DIKETAHUI';
            }
          } else {
            raw = row.namaAO || '(blank)';
          }
          return (aoMap.get(raw) || raw).toUpperCase();
        })(),
        productBucket: (row.produkKredit?.trim() === '19.3' ? 'Kredit Sindikasi' : row.produkKredit) || '(blank)',
        sektorBucket: row.sektorEkonomi || 'LAIN-LAIN',
        interestRateBucket: classifyByRange(row.sukuBunga, bungaPdfRanges),
        tenorBucket: classifyByRange(row.jangkaBulan, tenorPdfRanges),
        plafondBucket: classifyByRange(row.plafon, plafondPdfRanges),
        agunanBucket: row.agunanJenis || 'TIDAK DIKETAHUI'
      };
    });

    const reportRows = mapToReportRows(rows);
    const prevReportRows = mapToReportRows(prevRows);`;

  if (code.includes(oldEnd)) {
    code = code.replace(oldEnd, newEnd);
    fs.writeFileSync('app/performa/kolektibilitas/page.tsx', code);
    console.log('Wrapped reportRows into mapToReportRows');
  } else {
    console.log('Could not find end of map function');
  }
} else {
  console.log('Could not find reportRows map start');
}
