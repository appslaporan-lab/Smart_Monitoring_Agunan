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
`;

code = code.replace("return (\n    <main", matrixRanges + "\n\n  return (\n    <main");

const matrixHTML = `
      <section className="card" style={{ padding: 24, marginBottom: 24, overflowX: 'auto' }}>
        <h2>Matrix Range Tunggakan vs Radius (Nominal Outstanding)</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
          <thead>
            <tr style={{ backgroundColor: '#db2777', color: 'white' }}>
              <th rowSpan={2} style={{ padding: 8, border: '1px solid #94a3b8', textAlign: 'left', minWidth: '150px' }}>RANGE TUNGGAKAN HARI</th>
              <th colSpan={matrixRadiusRanges.length} style={{ padding: 8, border: '1px solid #94a3b8', textAlign: 'center' }}>RANGE RADIUS</th>
              <th rowSpan={2} style={{ padding: 8, border: '1px solid #94a3b8', minWidth: '150px' }}>Grand Total</th>
              <th rowSpan={2} style={{ padding: 8, border: '1px solid #94a3b8' }}>%</th>
            </tr>
            <tr style={{ backgroundColor: '#f472b6', color: 'white' }}>
              {matrixRadiusRanges.map(col => (
                <th key={col.label} style={{ padding: 8, border: '1px solid #94a3b8' }}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrixData.map(row => (
              <tr key={row.label}>
                <td style={{ padding: 8, border: '1px solid #cbd5e1', textAlign: 'left', fontWeight: 600 }}>{row.label}</td>
                {row.columns.map((val, idx) => (
                  <td key={idx} style={{ padding: 8, border: '1px solid #cbd5e1' }}>{val === 0 ? '-' : formatRupiah(val)}</td>
                ))}
                <td style={{ padding: 8, border: '1px solid #cbd5e1', fontWeight: 600 }}>{formatRupiah(row.total)}</td>
                <td style={{ padding: 8, border: '1px solid #cbd5e1' }}>{overallMatrixTotal > 0 ? ((row.total / overallMatrixTotal) * 100).toFixed(2) : '0.00'}%</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: '#0ea5e9', color: 'white', fontWeight: 'bold' }}>
              <td style={{ padding: 8, border: '1px solid #94a3b8', textAlign: 'left' }}>Grand Total</td>
              {matrixColTotals.map((val, idx) => (
                <td key={idx} style={{ padding: 8, border: '1px solid #94a3b8' }}>{formatRupiah(val)}</td>
              ))}
              <td style={{ padding: 8, border: '1px solid #94a3b8' }}>{formatRupiah(overallMatrixTotal)}</td>
              <td style={{ padding: 8, border: '1px solid #94a3b8' }}>100.00%</td>
            </tr>
          </tfoot>
        </table>
      </section>
`;

code = code.replace("</main>", matrixHTML + "\n    </main>");
fs.writeFileSync('app/performa/kolektibilitas/page.tsx', code);
console.log('Matrix injected');
