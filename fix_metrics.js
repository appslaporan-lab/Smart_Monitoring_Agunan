const fs = require('fs');

let code = fs.readFileSync('app/performa/kolektibilitas/page.tsx', 'utf8');

// 1. Overall Comparison Fixes
// Replace the mapping function return inside overall comparison
const oldOverallReturn = `return (
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
                       );`;

const newOverallReturn = `const isGoodIncrease = k === 'total' || k === '1';
                       const colorNOA = diffNOA === 0 ? 'inherit' : (diffNOA > 0 ? (isGoodIncrease ? '#16a34a' : '#dc2626') : (isGoodIncrease ? '#dc2626' : '#16a34a'));
                       const colorOS = diffOS === 0 ? 'inherit' : (diffOS > 0 ? (isGoodIncrease ? '#16a34a' : '#dc2626') : (isGoodIncrease ? '#dc2626' : '#16a34a'));

                       return (
                         <tr key={k} style={{ backgroundColor: key === 'total' ? '#f8fafc' : 'white', fontWeight: key === 'total' ? 'bold' : 'normal' }}>
                           <td style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'left' }}>
                             {key === 'total' ? 'Grand Total' : \`KOL \${k}\`}
                           </td>
                           <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{p.noa}</td>
                           <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{formatRupiah(p.os)}</td>
                           <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{c.noa}</td>
                           <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{formatRupiah(c.os)}</td>
                           <td style={{ padding: '8px', border: '1px solid #cbd5e1', color: colorNOA }}>
                             {diffNOA > 0 ? '+' : ''}{diffNOA}
                           </td>
                           <td style={{ padding: '8px', border: '1px solid #cbd5e1', color: colorOS }}>
                             {diffOS > 0 ? '+' : ''}{formatRupiah(diffOS)}
                           </td>
                         </tr>
                       );`;

if (code.includes(oldOverallReturn)) {
    code = code.replace(oldOverallReturn, newOverallReturn);
}

// 2. Overall Warning Fix
const oldWarning = `{currentStats.total.os > prevStats.total.os && (
                <div style={{ padding: 12, backgroundColor: '#fef2f2', borderLeft: '4px solid #dc2626', color: '#991b1b', borderRadius: '4px' }}>
                  <strong>⚠️ Peringatan!</strong> Total OS secara keseluruhan mengalami <strong>kenaikan</strong> dibandingkan bulan sebelumnya.
                </div>
              )}`;

const newWarning = `{currentStats.total.os < prevStats.total.os && (
                <div style={{ padding: 12, backgroundColor: '#fef2f2', borderLeft: '4px solid #dc2626', color: '#991b1b', borderRadius: '4px' }}>
                  <strong>⚠️ Peringatan!</strong> Total OS secara keseluruhan mengalami <strong>penurunan</strong> dibandingkan bulan sebelumnya. Pastikan target ekspansi kredit tercapai.
                </div>
              )}`;

if (code.includes(oldWarning)) {
    code = code.replace(oldWarning, newWarning);
}

// 3. AO Comparison Fixes
const oldAoHeaders = `<th colSpan={3} style={{ padding: '8px', border: '1px solid #334155', textAlign: 'center' }}>NPL (OS)</th>
                </tr>
                <tr style={{ backgroundColor: '#1e293b', color: 'white' }}>
                  <th style={{ padding: '4px 8px', border: '1px solid #334155' }}>Bulan Lalu</th>
                  <th style={{ padding: '4px 8px', border: '1px solid #334155' }}>Bulan Ini</th>
                  <th style={{ padding: '4px 8px', border: '1px solid #334155' }}>Δ</th>
                  <th style={{ padding: '4px 8px', border: '1px solid #334155' }}>Bulan Lalu</th>
                  <th style={{ padding: '4px 8px', border: '1px solid #334155' }}>Bulan Ini</th>
                  <th style={{ padding: '4px 8px', border: '1px solid #334155' }}>Δ</th>
                  <th style={{ padding: '4px 8px', border: '1px solid #334155' }}>Bulan Lalu</th>
                  <th style={{ padding: '4px 8px', border: '1px solid #334155' }}>Bulan Ini</th>
                  <th style={{ padding: '4px 8px', border: '1px solid #334155' }}>Δ</th>
                </tr>`;

const newAoHeaders = `<th colSpan={3} style={{ padding: '8px', border: '1px solid #334155', textAlign: 'center' }}>NPL (OS)</th>
                  <th colSpan={3} style={{ padding: '8px', border: '1px solid #334155', textAlign: 'center' }}>% NPL</th>
                </tr>
                <tr style={{ backgroundColor: '#1e293b', color: 'white' }}>
                  <th style={{ padding: '4px 8px', border: '1px solid #334155' }}>Bulan Lalu</th>
                  <th style={{ padding: '4px 8px', border: '1px solid #334155' }}>Bulan Ini</th>
                  <th style={{ padding: '4px 8px', border: '1px solid #334155' }}>Δ</th>
                  <th style={{ padding: '4px 8px', border: '1px solid #334155' }}>Bulan Lalu</th>
                  <th style={{ padding: '4px 8px', border: '1px solid #334155' }}>Bulan Ini</th>
                  <th style={{ padding: '4px 8px', border: '1px solid #334155' }}>Δ</th>
                  <th style={{ padding: '4px 8px', border: '1px solid #334155' }}>Bulan Lalu</th>
                  <th style={{ padding: '4px 8px', border: '1px solid #334155' }}>Bulan Ini</th>
                  <th style={{ padding: '4px 8px', border: '1px solid #334155' }}>Δ</th>
                  <th style={{ padding: '4px 8px', border: '1px solid #334155' }}>Bulan Lalu</th>
                  <th style={{ padding: '4px 8px', border: '1px solid #334155' }}>Bulan Ini</th>
                  <th style={{ padding: '4px 8px', border: '1px solid #334155' }}>Δ</th>
                </tr>`;

if (code.includes(oldAoHeaders)) {
    code = code.replace(oldAoHeaders, newAoHeaders);
}

const oldAoRow = `const p_NPL_OS = p_Rows.filter(r => r.isNpl).reduce((sum, r) => sum + r.outstanding, 0);
                  
                  return (
                    <tr key={ao} style={{ borderBottom: '1px solid #cbd5e1' }}>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'left', fontWeight: 'bold' }}>{ao}</td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{formatRupiah(p_OS)}</td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{formatRupiah(c_OS)}</td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1', color: c_OS - p_OS > 0 ? '#dc2626' : c_OS - p_OS < 0 ? '#16a34a' : 'inherit' }}>
                        {c_OS - p_OS > 0 ? '+' : ''}{formatRupiah(c_OS - p_OS)}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{formatRupiah(p_K2_OS)}</td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{formatRupiah(c_K2_OS)}</td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1', color: c_K2_OS - p_K2_OS > 0 ? '#d97706' : c_K2_OS - p_K2_OS < 0 ? '#16a34a' : 'inherit', fontWeight: c_K2_OS - p_K2_OS > 0 ? 'bold' : 'normal' }}>
                        {c_K2_OS - p_K2_OS > 0 ? '+' : ''}{formatRupiah(c_K2_OS - p_K2_OS)}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{formatRupiah(p_NPL_OS)}</td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{formatRupiah(c_NPL_OS)}</td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1', color: c_NPL_OS - p_NPL_OS > 0 ? '#dc2626' : c_NPL_OS - p_NPL_OS < 0 ? '#16a34a' : 'inherit', fontWeight: c_NPL_OS - p_NPL_OS > 0 ? 'bold' : 'normal' }}>
                        {c_NPL_OS - p_NPL_OS > 0 ? '+' : ''}{formatRupiah(c_NPL_OS - p_NPL_OS)}
                      </td>
                    </tr>
                  );`;

const newAoRow = `const p_NPL_OS = p_Rows.filter(r => r.isNpl).reduce((sum, r) => sum + r.outstanding, 0);
                  
                  const p_NPL_Pct = p_OS > 0 ? (p_NPL_OS / p_OS) * 100 : 0;
                  const c_NPL_Pct = c_OS > 0 ? (c_NPL_OS / c_OS) * 100 : 0;
                  const diff_NPL_Pct = c_NPL_Pct - p_NPL_Pct;

                  return (
                    <tr key={ao} style={{ borderBottom: '1px solid #cbd5e1' }}>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'left', fontWeight: 'bold' }}>{ao}</td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{formatRupiah(p_OS)}</td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{formatRupiah(c_OS)}</td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1', color: c_OS - p_OS > 0 ? '#16a34a' : c_OS - p_OS < 0 ? '#dc2626' : 'inherit' }}>
                        {c_OS - p_OS > 0 ? '+' : ''}{formatRupiah(c_OS - p_OS)}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{formatRupiah(p_K2_OS)}</td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{formatRupiah(c_K2_OS)}</td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1', color: c_K2_OS - p_K2_OS > 0 ? '#d97706' : c_K2_OS - p_K2_OS < 0 ? '#16a34a' : 'inherit', fontWeight: c_K2_OS - p_K2_OS > 0 ? 'bold' : 'normal' }}>
                        {c_K2_OS - p_K2_OS > 0 ? '+' : ''}{formatRupiah(c_K2_OS - p_K2_OS)}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{formatRupiah(p_NPL_OS)}</td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{formatRupiah(c_NPL_OS)}</td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1', color: c_NPL_OS - p_NPL_OS > 0 ? '#dc2626' : c_NPL_OS - p_NPL_OS < 0 ? '#16a34a' : 'inherit', fontWeight: c_NPL_OS - p_NPL_OS > 0 ? 'bold' : 'normal' }}>
                        {c_NPL_OS - p_NPL_OS > 0 ? '+' : ''}{formatRupiah(c_NPL_OS - p_NPL_OS)}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{formatPercent(p_NPL_Pct)}</td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{formatPercent(c_NPL_Pct)}</td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1', color: diff_NPL_Pct > 0 ? '#dc2626' : diff_NPL_Pct < 0 ? '#16a34a' : 'inherit', fontWeight: diff_NPL_Pct > 0 ? 'bold' : 'normal' }}>
                        {diff_NPL_Pct > 0 ? '+' : ''}{formatPercent(diff_NPL_Pct)}
                      </td>
                    </tr>
                  );`;

if (code.includes(oldAoRow)) {
    code = code.replace(oldAoRow, newAoRow);
}

fs.writeFileSync('app/performa/kolektibilitas/page.tsx', code);
console.log('Done fixes');
