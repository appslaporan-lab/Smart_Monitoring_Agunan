const fs = require('fs');
let code = fs.readFileSync('app/performa/kolektibilitas/page.tsx', 'utf8');

const matrixRanges = `
  const matrixRadiusRanges = [
    { label: '1-10 KM', min: 0, max: 10 },
    { label: '11-20 KM', min: 11, max: 20 },
    { label: '21-30 KM', min: 21, max: 30 },
    { label: '31-50 KM', min: 31, max: 50 },
    { label: '51-100 KM', min: 51, max: 100 },
    { label: '>100 KM', min: 101 },
  ];
  
  const matrixTunggakanRanges = [
    { label: '0 - 15 Hari', min: 0, max: 15 },
    { label: '16 - 30 Hari', min: 16, max: 30 },
    { label: '31 - 60 Hari', min: 31, max: 60 },
    { label: '61 - 90 Hari', min: 61, max: 90 },
    { label: '91 - 120 Hari', min: 91, max: 120 },
    { label: '120 - 180 Hari', min: 121, max: 180 },
    { label: '> 181 Hari', min: 181 },
  ];

  const matrixData = matrixTunggakanRanges.map(tRow => {
    const rowEntries = rows.filter(r => classifyByRange(r.hariTunggakan, matrixTunggakanRanges) === tRow.label);
    const rowRadiusData = matrixRadiusRanges.map(rCol => {
      const cellEntries = rowEntries.filter(r => classifyByRange(r.jarakKantorKm || 0, matrixRadiusRanges) === rCol.label);
      return cellEntries.reduce((sum, r) => sum + (r.outstanding || 0), 0);
    });
    const rowTotal = rowRadiusData.reduce((a, b) => a + b, 0);
    return {
      label: tRow.label,
      columns: rowRadiusData,
      total: rowTotal
    };
  });

  const overallMatrixTotal = matrixData.reduce((sum, r) => sum + r.total, 0);
  const matrixColTotals = matrixRadiusRanges.map((_, colIdx) => matrixData.reduce((sum, r) => sum + r.columns[colIdx], 0));

  return (
    <main className="container">`;

// Find the last "return (" inside PerformaKolektibilitasPage
const index = code.lastIndexOf('return (\n    <main className="container">');
if (index !== -1) {
    code = code.slice(0, index) + matrixRanges + code.slice(index + 'return (\n    <main className="container">'.length);
} else {
    // try finding it without exact spacing
    code = code.replace(/return\s*\(\s*<main className="container">/, matrixRanges);
}

fs.writeFileSync('app/performa/kolektibilitas/page.tsx', code);
console.log('Fixed');
