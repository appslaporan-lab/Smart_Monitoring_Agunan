const fs = require('fs');
let code = fs.readFileSync('app/performa/kolektibilitas/page.tsx', 'utf8');

const targetStr = `{renderAOSummaryTable()}`;
const newCode = `{renderAOSummaryTable()}

      <section className="card" style={{ padding: 24, marginBottom: 24, overflowX: 'auto', fontSize: '13px' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: 16 }}>Analisis Perbandingan AO (MoM)</h2>
        {!periodeSebelumnya ? (
          <p>Data bulan sebelumnya tidak tersedia untuk perbandingan.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ backgroundColor: '#0f172a', color: 'white' }}>
                <th rowSpan={2} style={{ padding: '8px', border: '1px solid #334155', textAlign: 'left' }}>AO / MO</th>
                <th colSpan={3} style={{ padding: '8px', border: '1px solid #334155', textAlign: 'center' }}>Total OS</th>
                <th colSpan={3} style={{ padding: '8px', border: '1px solid #334155', textAlign: 'center' }}>KOL 2 (OS)</th>
                <th colSpan={3} style={{ padding: '8px', border: '1px solid #334155', textAlign: 'center' }}>NPL (OS)</th>
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
              </tr>
            </thead>
            <tbody>
              {Array.from(new Set([...reportRows.map(r => r.moName), ...prevReportRows.map(r => r.moName)])).sort().map(ao => {
                const c_Rows = reportRows.filter(r => r.moName === ao);
                const p_Rows = prevReportRows.filter(r => r.moName === ao);
                
                const c_OS = c_Rows.reduce((sum, r) => sum + r.outstanding, 0);
                const p_OS = p_Rows.reduce((sum, r) => sum + r.outstanding, 0);
                
                const c_K2_OS = c_Rows.filter(r => r.kol === '2').reduce((sum, r) => sum + r.outstanding, 0);
                const p_K2_OS = p_Rows.filter(r => r.kol === '2').reduce((sum, r) => sum + r.outstanding, 0);
                
                const c_NPL_OS = c_Rows.filter(r => r.isNpl).reduce((sum, r) => sum + r.outstanding, 0);
                const p_NPL_OS = p_Rows.filter(r => r.isNpl).reduce((sum, r) => sum + r.outstanding, 0);
                
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
                );
              })}
            </tbody>
          </table>
        )}
      </section>`;

code = code.replace(targetStr, newCode);
fs.writeFileSync('app/performa/kolektibilitas/page.tsx', code);
console.log('Added AO comparison table');
