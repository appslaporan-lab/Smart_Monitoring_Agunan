const fs = require('fs');
let code = fs.readFileSync('app/performa/kolektibilitas/page.tsx', 'utf8');

const detailedTableComponent = `
type KolStats = { noa: number; os: number };
type DetailedTableRow = {
  label: string;
  k1: KolStats; k2: KolStats; k3: KolStats; k4: KolStats; k5: KolStats;
  nonNpl: KolStats; npl: KolStats; total: KolStats;
};

const Cell = ({ v }: { v: KolStats }) => (
  <>
    <td style={{ padding: '4px 8px', border: '1px solid #000', textAlign: 'right' }}>{v.noa === 0 ? '-' : formatRupiah(v.noa)}</td>
    <td style={{ padding: '4px 8px', border: '1px solid #000', textAlign: 'right' }}>{v.os === 0 ? '-' : formatRupiah(v.os)}</td>
  </>
);

function renderDetailedSummaryTable(title: string, rows: DetailedTableRow[]) {
  const grandTotal: DetailedTableRow = {
    label: 'Grand Total',
    k1: {noa:0, os:0}, k2: {noa:0, os:0}, k3: {noa:0, os:0}, k4: {noa:0, os:0}, k5: {noa:0, os:0},
    nonNpl: {noa:0, os:0}, npl: {noa:0, os:0}, total: {noa:0, os:0}
  };

  for (const r of rows) {
    for (const k of ['k1','k2','k3','k4','k5','nonNpl','npl','total'] as const) {
      grandTotal[k].noa += r[k].noa;
      grandTotal[k].os += r[k].os;
    }
  }

  return (
    <section className="card" style={{ padding: 24, marginBottom: 24, overflowX: 'auto', fontSize: '13px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th rowSpan={3} style={{ padding: '4px 8px', border: '1px solid #000', backgroundColor: '#e2e8f0', minWidth: '150px' }}>{title}</th>
            <th colSpan={10} style={{ padding: '4px 8px', border: '1px solid #000', backgroundColor: '#e2e8f0' }}>KOLEKTIBILITAS</th>
            <th colSpan={2} style={{ padding: '4px 8px', border: '1px solid #000', backgroundColor: '#86efac' }}>NON NPL</th>
            <th colSpan={2} style={{ padding: '4px 8px', border: '1px solid #000', backgroundColor: '#fca5a5' }}>NPL</th>
            <th rowSpan={3} style={{ padding: '4px 8px', border: '1px solid #000', backgroundColor: '#e2e8f0' }}>Total NOA</th>
            <th rowSpan={3} style={{ padding: '4px 8px', border: '1px solid #000', backgroundColor: '#e2e8f0' }}>Total OS</th>
            <th rowSpan={3} style={{ padding: '4px 8px', border: '1px solid #000', backgroundColor: '#fef08a' }}>% NPL</th>
          </tr>
          <tr style={{ backgroundColor: '#e2e8f0' }}>
            <th colSpan={2} style={{ border: '1px solid #000' }}>1</th>
            <th colSpan={2} style={{ border: '1px solid #000' }}>2</th>
            <th colSpan={2} style={{ border: '1px solid #000' }}>3</th>
            <th colSpan={2} style={{ border: '1px solid #000' }}>4</th>
            <th colSpan={2} style={{ border: '1px solid #000' }}>5</th>
            <th colSpan={2} style={{ border: '1px solid #000', backgroundColor: '#86efac' }}></th>
            <th colSpan={2} style={{ border: '1px solid #000', backgroundColor: '#fca5a5' }}></th>
          </tr>
          <tr style={{ backgroundColor: '#e2e8f0' }}>
            <th style={{ border: '1px solid #000', padding: '4px' }}>NOA</th><th style={{ border: '1px solid #000', padding: '4px' }}>OS</th>
            <th style={{ border: '1px solid #000', padding: '4px' }}>NOA</th><th style={{ border: '1px solid #000', padding: '4px' }}>OS</th>
            <th style={{ border: '1px solid #000', padding: '4px' }}>NOA</th><th style={{ border: '1px solid #000', padding: '4px' }}>OS</th>
            <th style={{ border: '1px solid #000', padding: '4px' }}>NOA</th><th style={{ border: '1px solid #000', padding: '4px' }}>OS</th>
            <th style={{ border: '1px solid #000', padding: '4px' }}>NOA</th><th style={{ border: '1px solid #000', padding: '4px' }}>OS</th>
            <th style={{ border: '1px solid #000', padding: '4px', backgroundColor: '#86efac' }}>NOA</th><th style={{ border: '1px solid #000', padding: '4px', backgroundColor: '#86efac' }}>OS</th>
            <th style={{ border: '1px solid #000', padding: '4px', backgroundColor: '#fca5a5' }}>NOA</th><th style={{ border: '1px solid #000', padding: '4px', backgroundColor: '#fca5a5' }}>OS</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ backgroundColor: '#fff' }}>
              <td style={{ padding: '4px 8px', border: '1px solid #000' }}>{r.label}</td>
              <Cell v={r.k1} /> <Cell v={r.k2} /> <Cell v={r.k3} /> <Cell v={r.k4} /> <Cell v={r.k5} />
              <Cell v={r.nonNpl} /> <Cell v={r.npl} />
              <td style={{ padding: '4px 8px', border: '1px solid #000', textAlign: 'right' }}>{r.total.noa === 0 ? '-' : formatRupiah(r.total.noa)}</td>
              <td style={{ padding: '4px 8px', border: '1px solid #000', textAlign: 'right' }}>{r.total.os === 0 ? '-' : formatRupiah(r.total.os)}</td>
              <td style={{ padding: '4px 8px', border: '1px solid #000', textAlign: 'right' }}>
                {r.total.os ? formatPercent((r.npl.os / r.total.os) * 100) : '0,00%'}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ backgroundColor: '#38bdf8', color: '#000', fontWeight: 'bold' }}>
            <td style={{ padding: '4px 8px', border: '1px solid #000' }}>Grand Total</td>
            <Cell v={grandTotal.k1} /> <Cell v={grandTotal.k2} /> <Cell v={grandTotal.k3} /> <Cell v={grandTotal.k4} /> <Cell v={grandTotal.k5} />
            <Cell v={grandTotal.nonNpl} /> <Cell v={grandTotal.npl} />
            <td style={{ padding: '4px 8px', border: '1px solid #000', textAlign: 'right' }}>{formatRupiah(grandTotal.total.noa)}</td>
            <td style={{ padding: '4px 8px', border: '1px solid #000', textAlign: 'right' }}>{formatRupiah(grandTotal.total.os)}</td>
            <td style={{ padding: '4px 8px', border: '1px solid #000', textAlign: 'right' }}>
              {grandTotal.total.os ? formatPercent((grandTotal.npl.os / grandTotal.total.os) * 100) : '0,00%'}
            </td>
          </tr>
        </tfoot>
      </table>
    </section>
  );
}
`;

// Find `type SummaryRow` and replace up to the end of `renderPDFSummaryTable`
const startIdx = code.indexOf('type SummaryRow = {');
const endIdx = code.indexOf('export default async function PerformaKolektibilitasPage() {');
if (startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + detailedTableComponent + '\n' + code.substring(endIdx);
}

// Inside PerformaKolektibilitasPage, we replace `buildSummary` and all `*Summary` vars
const summaryLogic = `
  function buildDetailedSummary(groupKey: keyof typeof reportRows[0], predefinedKeys?: string[]) {
    let keys = predefinedKeys;
    if (!keys) {
      keys = Array.from(new Set(reportRows.map(r => String(r[groupKey]))));
      keys.sort();
    }
    
    return keys.map(key => {
      const entries = reportRows.filter(r => String(r[groupKey]) === key);
      const stats = {
        k1: {noa:0, os:0}, k2: {noa:0, os:0}, k3: {noa:0, os:0}, k4: {noa:0, os:0}, k5: {noa:0, os:0},
        nonNpl: {noa:0, os:0}, npl: {noa:0, os:0}, total: {noa:0, os:0}
      };

      for (const e of entries) {
        stats.total.noa++; stats.total.os += e.outstanding;
        if (e.isNpl) { stats.npl.noa++; stats.npl.os += e.outstanding; }
        else { stats.nonNpl.noa++; stats.nonNpl.os += e.outstanding; }

        if (e.kol === '1') { stats.k1.noa++; stats.k1.os += e.outstanding; }
        else if (e.kol === '2') { stats.k2.noa++; stats.k2.os += e.outstanding; }
        else if (e.kol === '3') { stats.k3.noa++; stats.k3.os += e.outstanding; }
        else if (e.kol === '4') { stats.k4.noa++; stats.k4.os += e.outstanding; }
        else if (e.kol === '5' || e.kol === '6') { stats.k5.noa++; stats.k5.os += e.outstanding; }
      }

      return { label: key, ...stats };
    });
  }

  const tenorSummary = buildDetailedSummary('tenorBucket', tenorPdfRanges.map(r => r.label));
  const productSummary = buildDetailedSummary('productBucket');
  const plafondSummary = buildDetailedSummary('plafondBucket', plafondPdfRanges.map(r => r.label));
  const bungaSummary = buildDetailedSummary('interestRateBucket', bungaPdfRanges.map(r => r.label));
  const agunanSummary = buildDetailedSummary('collateralBucket');
  const aoSummary = buildDetailedSummary('moName');
`;

const sumStartIdx = code.indexOf('function buildSummary(groupKey');
const sumEndIdx = code.indexOf('const kantorOrder = [');
if (sumStartIdx !== -1 && sumEndIdx !== -1) {
  code = code.substring(0, sumStartIdx) + summaryLogic + '\n  ' + code.substring(sumEndIdx);
}

// Remove the `type KolStats` and `Cell` definition inside PerformaKolektibilitasPage since it's now at the top
code = code.replace(/type KolStats = \{ noa: number; os: number \};\n/g, '');
code = code.replace(/const Cell = \(\{ v \}: \{ v: KolStats \}\) => \([\s\S]*?<\/>\n  \);\n/m, '');

// Replace renderPDFSummaryTable calls
code = code.replace(/{renderPDFSummaryTable/g, '{renderDetailedSummaryTable');

fs.writeFileSync('app/performa/kolektibilitas/page.tsx', code);
console.log('Tables detailed version 2');
