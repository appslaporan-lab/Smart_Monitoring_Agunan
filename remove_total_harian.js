const fs = require('fs');
const path = 'app/kpi/performa-karyawan/page.tsx';
let code = fs.readFileSync(path, 'utf8');

const dailyTotalsBlock = `  // Calculate daily totals for each user
  const dailyTotals: Record<string, number> = {};
  records.forEach(r => {
    const key = \`\${r.userId}-\${new Date(r.tanggal).toISOString()}\`;
    if (!dailyTotals[key]) dailyTotals[key] = 0;
    dailyTotals[key] += r.jumlahKegiatan;
  });`;

code = code.replace(dailyTotalsBlock, '');

const oldHeaders = `<th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px 16px', textAlign: 'center' }}>Jml Kegiatan</th>
                  <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px 16px', textAlign: 'center' }}>Total Harian</th>
                  <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px 16px', textAlign: 'right' }}>Nominal</th>`;
const newHeaders = `<th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px 16px', textAlign: 'center' }}>Jml Kegiatan</th>
                  <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px 16px', textAlign: 'right' }}>Nominal</th>`;
code = code.replace(oldHeaders, newHeaders);

const oldMapStart = `{records.map(r => {
                  const key = \`\${r.userId}-\${new Date(r.tanggal).toISOString()}\`;
                  const totalHarian = dailyTotals[key] || 0;
                  return (
                  <tr key={r.id}>`;
const newMapStart = `{records.map(r => (
                  <tr key={r.id}>`;
code = code.replace(oldMapStart, newMapStart);

const oldRowData = `<td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px 16px', verticalAlign: 'top', textAlign: 'center' }}>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{r.jumlahKegiatan}</span>
                    </td>
                    <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px 16px', verticalAlign: 'top', textAlign: 'center' }}>
                      <span style={{ fontWeight: 600, color: '#3b82f6', background: '#eff6ff', padding: '4px 8px', borderRadius: 12, fontSize: 13 }}>{totalHarian}</span>
                    </td>
                    <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px 16px', verticalAlign: 'top', textAlign: 'right', whiteSpace: 'nowrap' }}>`;
const newRowData = `<td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px 16px', verticalAlign: 'top', textAlign: 'center' }}>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{r.jumlahKegiatan}</span>
                    </td>
                    <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px 16px', verticalAlign: 'top', textAlign: 'right', whiteSpace: 'nowrap' }}>`;
code = code.replace(oldRowData, newRowData);

const oldMapEnd = `</tr>
                );
                })}`;
const newMapEnd = `</tr>
                ))}`;
code = code.replace(oldMapEnd, newMapEnd);

fs.writeFileSync(path, code);
console.log('Removed from performa-karyawan');
