const fs = require('fs');
let code = fs.readFileSync('app/performa/kolektibilitas/page.tsx', 'utf8');

const aoLogic = `
  // --- CUSTOM AO TABLE LOGIC ---
  type AoGroupRow = DetailedTableRow & { isGroupTotal?: boolean; isGrandTotal?: boolean };
  const aoTableRows: AoGroupRow[] = [];
  const aoKantorOrder = ['PUSAT 1', 'PUSAT 2', 'CABANG'];
  
  const aoGrandTotal: DetailedTableRow = {
    label: 'Grand Total',
    k1: {noa:0, os:0}, k2: {noa:0, os:0}, k3: {noa:0, os:0}, k4: {noa:0, os:0}, k5: {noa:0, os:0},
    nonNpl: {noa:0, os:0}, npl: {noa:0, os:0}, total: {noa:0, os:0}
  };

  for (const groupName of aoKantorOrder) {
    const groupEntries = reportRows.filter(r => r.kantorGroup === groupName);
    if (groupEntries.length === 0) continue;

    const aoNames = Array.from(new Set(groupEntries.map(r => r.moName))).sort();
    
    const groupTotal: DetailedTableRow = {
      label: 'Total ' + groupName,
      k1: {noa:0, os:0}, k2: {noa:0, os:0}, k3: {noa:0, os:0}, k4: {noa:0, os:0}, k5: {noa:0, os:0},
      nonNpl: {noa:0, os:0}, npl: {noa:0, os:0}, total: {noa:0, os:0}
    };

    for (const ao of aoNames) {
      const entries = groupEntries.filter(r => r.moName === ao);
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

      aoTableRows.push({ label: ao, ...stats });

      for (const k of ['k1','k2','k3','k4','k5','nonNpl','npl','total'] as const) {
        groupTotal[k].noa += stats[k].noa;
        groupTotal[k].os += stats[k].os;
        aoGrandTotal[k].noa += stats[k].noa;
        aoGrandTotal[k].os += stats[k].os;
      }
    }
    aoTableRows.push({ ...groupTotal, isGroupTotal: true });
  }
  aoTableRows.push({ ...aoGrandTotal, isGrandTotal: true });

  const renderAOSummaryTable = () => {
    return (
      <section className="card" style={{ padding: 24, marginBottom: 24, overflowX: 'auto', fontSize: '13px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th rowSpan={3} style={{ padding: '4px 8px', border: '1px solid #000', backgroundColor: '#e2e8f0', minWidth: '150px' }}>AO</th>
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
            {aoTableRows.map((r, i) => {
              let bg = '#fff';
              let fw = 'normal' as 'normal' | 'bold';
              let nplPercent = r.total.os ? (r.npl.os / r.total.os) * 100 : 0;
              
              if (r.isGrandTotal) {
                bg = '#38bdf8'; fw = 'bold';
              } else if (r.isGroupTotal) {
                bg = '#a7f3d0'; fw = 'bold';
              } else if (nplPercent > 5) {
                bg = '#fecdd3'; // red-200 for high NPL
              }

              return (
                <tr key={i} style={{ backgroundColor: bg, fontWeight: fw }}>
                  <td style={{ padding: '4px 8px', border: '1px solid #000' }}>{r.label}</td>
                  <Cell v={r.k1} /> <Cell v={r.k2} /> <Cell v={r.k3} /> <Cell v={r.k4} /> <Cell v={r.k5} />
                  <Cell v={r.nonNpl} /> <Cell v={r.npl} />
                  <td style={{ padding: '4px 8px', border: '1px solid #000', textAlign: 'right' }}>{r.total.noa === 0 ? '-' : formatRupiah(r.total.noa)}</td>
                  <td style={{ padding: '4px 8px', border: '1px solid #000', textAlign: 'right' }}>{r.total.os === 0 ? '-' : formatRupiah(r.total.os)}</td>
                  <td style={{ padding: '4px 8px', border: '1px solid #000', textAlign: 'right' }}>
                    {r.total.os ? formatPercent(nplPercent) : '0,00%'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    );
  };
`;

// Remove the old `aoSummary` and replace it with the new logic
code = code.replace("const aoSummary = buildDetailedSummary('moName');", aoLogic);

// Replace `{renderDetailedSummaryTable('AO', aoSummary)}` with `{renderAOSummaryTable()}`
code = code.replace("{renderDetailedSummaryTable('AO', aoSummary)}", "{renderAOSummaryTable()}");

fs.writeFileSync('app/performa/kolektibilitas/page.tsx', code);
console.log('AO grouped');
