const fs = require('fs');

let code = fs.readFileSync('app/performa/kolektibilitas/page.tsx', 'utf8');

// 1. Find where to fetch prevRows
const fetchRowsStr = `let rows = await prisma.pinjamanPeriode.findMany({
    where: { periodeId: periodeAktif.id },
    orderBy: { id: 'asc' },
  });

  rows = rows.filter(r => canAccessKantorData(user.role, user.kantor, user.subKantor, r.subKantor));`;

const newFetchStr = `let rows = await prisma.pinjamanPeriode.findMany({
    where: { periodeId: periodeAktif.id },
    orderBy: { id: 'asc' },
  });

  rows = rows.filter(r => canAccessKantorData(user.role, user.kantor, user.subKantor, r.subKantor));

  const activeIndex = semuaPeriode.findIndex(p => p.id === periodeAktif.id);
  const periodeSebelumnya = semuaPeriode[activeIndex + 1];

  let prevRows = [];
  if (periodeSebelumnya) {
    prevRows = await prisma.pinjamanPeriode.findMany({
      where: { periodeId: periodeSebelumnya.id },
    });
    prevRows = prevRows.filter(r => canAccessKantorData(user.role, user.kantor, user.subKantor, r.subKantor));
  }

  function aggregateKolektibilitas(dataRows) {
    const stats = {
      total: { noa: 0, os: 0 },
      k1: { noa: 0, os: 0 },
      k2: { noa: 0, os: 0 },
      k3: { noa: 0, os: 0 },
      k4: { noa: 0, os: 0 },
      k5: { noa: 0, os: 0 },
    };
    for (const r of dataRows) {
      stats.total.noa++;
      stats.total.os += r.outstanding;
      if (r.kdKolektibilitas === '1') { stats.k1.noa++; stats.k1.os += r.outstanding; }
      else if (r.kdKolektibilitas === '2') { stats.k2.noa++; stats.k2.os += r.outstanding; }
      else if (r.kdKolektibilitas === '3') { stats.k3.noa++; stats.k3.os += r.outstanding; }
      else if (r.kdKolektibilitas === '4') { stats.k4.noa++; stats.k4.os += r.outstanding; }
      else if (r.kdKolektibilitas === '5' || r.kdKolektibilitas === '6') { stats.k5.noa++; stats.k5.os += r.outstanding; }
    }
    return stats;
  }

  const currentStats = aggregateKolektibilitas(rows);
  const prevStats = aggregateKolektibilitas(prevRows);
`;

code = code.replace(fetchRowsStr, newFetchStr);


// 2. Add the comparison JSX right before {renderDetailedSummaryTable('TENOR', tenorSummary)}
const targetJSX = `{renderDetailedSummaryTable('TENOR', tenorSummary)}`;

const comparisonJSX = `
      <section className="card" style={{ padding: 24, marginBottom: 32 }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: 16 }}>Analisis Perbandingan Kolektibilitas (MoM)</h2>
        {!periodeSebelumnya ? (
          <p>Data bulan sebelumnya tidak tersedia untuk perbandingan.</p>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', marginBottom: 16 }}>
                <thead>
                  <tr style={{ backgroundColor: '#0f172a', color: 'white' }}>
                    <th rowSpan={2} style={{ padding: '8px', border: '1px solid #334155', textAlign: 'left' }}>Kolektibilitas</th>
                    <th colSpan={2} style={{ padding: '8px', border: '1px solid #334155', textAlign: 'center' }}>{periodeSebelumnya.bulan}/{periodeSebelumnya.tahun}</th>
                    <th colSpan={2} style={{ padding: '8px', border: '1px solid #334155', textAlign: 'center' }}>{periodeAktif.bulan}/{periodeAktif.tahun}</th>
                    <th colSpan={2} style={{ padding: '8px', border: '1px solid #334155', textAlign: 'center' }}>Selisih</th>
                  </tr>
                  <tr style={{ backgroundColor: '#1e293b', color: 'white' }}>
                    <th style={{ padding: '4px 8px', border: '1px solid #334155' }}>NOA</th>
                    <th style={{ padding: '4px 8px', border: '1px solid #334155' }}>OS</th>
                    <th style={{ padding: '4px 8px', border: '1px solid #334155' }}>NOA</th>
                    <th style={{ padding: '4px 8px', border: '1px solid #334155' }}>OS</th>
                    <th style={{ padding: '4px 8px', border: '1px solid #334155' }}>Δ NOA</th>
                    <th style={{ padding: '4px 8px', border: '1px solid #334155' }}>Δ OS</th>
                  </tr>
                </thead>
                <tbody>
                  {['1', '2', '3', '4', '5', 'total'].map(k => {
                     const key = k === 'total' ? 'total' : \`k\${k}\`;
                     const c = currentStats[key];
                     const p = prevStats[key];
                     const diffNOA = c.noa - p.noa;
                     const diffOS = c.os - p.os;

                     return (
                       <tr key={k} style={{ backgroundColor: key === 'total' ? '#f8fafc' : 'white', fontWeight: key === 'total' ? 'bold' : 'normal' }}>
                         <td style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'left' }}>
                           {key === 'total' ? 'Grand Total' : \`KOL \${k}\`}
                         </td>
                         <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{p.noa}</td>
                         <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{formatRupiah(p.os)}</td>
                         <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{c.noa}</td>
                         <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{formatRupiah(c.os)}</td>
                         <td style={{ padding: '8px', border: '1px solid #cbd5e1', color: diffNOA > 0 ? '#dc2626' : diffNOA < 0 ? '#16a34a' : 'inherit' }}>
                           {diffNOA > 0 ? '+' : ''}{diffNOA}
                         </td>
                         <td style={{ padding: '8px', border: '1px solid #cbd5e1', color: diffOS > 0 ? '#dc2626' : diffOS < 0 ? '#16a34a' : 'inherit' }}>
                           {diffOS > 0 ? '+' : ''}{formatRupiah(diffOS)}
                         </td>
                       </tr>
                     );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {currentStats.total.os > prevStats.total.os && (
                <div style={{ padding: 12, backgroundColor: '#fef2f2', borderLeft: '4px solid #dc2626', color: '#991b1b', borderRadius: '4px' }}>
                  <strong>⚠️ Peringatan!</strong> Total OS secara keseluruhan mengalami <strong>kenaikan</strong> dibandingkan bulan sebelumnya.
                </div>
              )}
              {(currentStats.k2.os > prevStats.k2.os || currentStats.k2.noa > prevStats.k2.noa) && (
                <div style={{ padding: 12, backgroundColor: '#fffbeb', borderLeft: '4px solid #f59e0b', color: '#92400e', borderRadius: '4px' }}>
                  <strong>⚠️ Perhatian (KOL 2 Naik):</strong> OS atau NOA pada Kolektibilitas 2 meningkat! Segera lakukan penagihan lebih awal agar tidak jatuh ke KOL 3 atau carikan solusi lain.
                </div>
              )}
              {['3', '4', '5'].map(k => {
                const key = \`k\${k}\`;
                if (currentStats[key].os > prevStats[key].os || currentStats[key].noa > prevStats[key].noa) {
                  return (
                    <div key={k} style={{ padding: 12, backgroundColor: '#fef2f2', borderLeft: '4px solid #b91c1c', color: '#7f1d1d', borderRadius: '4px' }}>
                      <strong>🚨 Awas (KOL {k} Naik):</strong> Terdapat kenaikan NPL pada Kolektibilitas {k} dibanding bulan sebelumnya. Mohon evaluasi pergerakan/recovery agunan!
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </>
        )}
      </section>

      ${targetJSX}`;

code = code.replace(targetJSX, comparisonJSX);

fs.writeFileSync('app/performa/kolektibilitas/page.tsx', code);
console.log('Added comparison section');
