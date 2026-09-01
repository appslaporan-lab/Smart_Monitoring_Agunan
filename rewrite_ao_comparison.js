const fs = require('fs');

let code = fs.readFileSync('app/performa/kolektibilitas/page.tsx', 'utf8');

const startTag = `<h2 style={{ fontSize: '1.25rem', marginBottom: 16 }}>Analisis Perbandingan AO (MoM)</h2>`;
const startIndex = code.indexOf(startTag);

if (startIndex !== -1) {
    // Find the enclosing section start
    const sectionStart = code.lastIndexOf('<section className="card"', startIndex);
    
    // Find the closing section tag by counting <section> and </section>
    // Or just look for </section> after startIndex
    const sectionEnd = code.indexOf('</section>', startIndex) + '</section>'.length;
    
    const newSection = `<section className="card" style={{ padding: 24, marginBottom: 24, overflowX: 'auto', fontSize: '13px' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: 16 }}>Analisis Perbandingan AO (MoM) & Rekomendasi</h2>
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
                <th colSpan={3} style={{ padding: '8px', border: '1px solid #334155', textAlign: 'center' }}>% NPL</th>
                <th rowSpan={2} style={{ padding: '8px', border: '1px solid #334155', textAlign: 'center' }}>Status</th>
                <th rowSpan={2} style={{ padding: '8px', border: '1px solid #334155', textAlign: 'left', minWidth: '200px' }}>Rekomendasi / Solusi</th>
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
                
                const p_NPL_Pct = p_OS > 0 ? (p_NPL_OS / p_OS) * 100 : 0;
                const c_NPL_Pct = c_OS > 0 ? (c_NPL_OS / c_OS) * 100 : 0;
                const diff_NPL_Pct = c_NPL_Pct - p_NPL_Pct;

                const diff_OS = c_OS - p_OS;
                const diff_K2_OS = c_K2_OS - p_K2_OS;
                const diff_NPL_OS = c_NPL_OS - p_NPL_OS;

                let flag = '🟢';
                let bgFlag = '#dcfce7'; // green-100
                let textFlag = '#166534'; // green-800
                let recommendation = 'Performa membaik. Pertahankan ekspansi kredit & pantau kelancaran.';

                if (diff_NPL_Pct > 0 || diff_NPL_OS > 0) {
                  flag = '🔴';
                  bgFlag = '#fee2e2'; // red-100
                  textFlag = '#991b1b'; // red-800
                  recommendation = 'NPL Naik (BERBAHAYA)! Segera lakukan penagihan intensif, layangkan Surat Peringatan, atau eksekusi lelang agunan.';
                } else if (diff_K2_OS > 0) {
                  flag = '🟡';
                  bgFlag = '#fef3c7'; // amber-100
                  textFlag = '#92400e'; // amber-800
                  recommendation = 'KOL 2 Naik (AWAS)! Segera lakukan desk call dan kunjungan penagihan sebelum menjadi macet (NPL).';
                } else if (diff_OS < 0) {
                  flag = '🟡';
                  bgFlag = '#fef3c7';
                  textFlag = '#92400e';
                  recommendation = 'Total OS Turun! Perlu peringatan karena ekspansi kredit menyusut. Genjot pencairan kredit baru.';
                }

                return (
                  <tr key={ao} style={{ borderBottom: '1px solid #cbd5e1' }}>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'left', fontWeight: 'bold' }}>{ao}</td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{formatRupiah(p_OS)}</td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{formatRupiah(c_OS)}</td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1', color: diff_OS > 0 ? '#16a34a' : diff_OS < 0 ? '#dc2626' : 'inherit' }}>
                      {diff_OS > 0 ? '+' : ''}{formatRupiah(diff_OS)}
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{formatRupiah(p_K2_OS)}</td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{formatRupiah(c_K2_OS)}</td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1', color: diff_K2_OS > 0 ? '#d97706' : diff_K2_OS < 0 ? '#16a34a' : 'inherit', fontWeight: diff_K2_OS > 0 ? 'bold' : 'normal' }}>
                      {diff_K2_OS > 0 ? '+' : ''}{formatRupiah(diff_K2_OS)}
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{formatRupiah(p_NPL_OS)}</td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{formatRupiah(c_NPL_OS)}</td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1', color: diff_NPL_OS > 0 ? '#dc2626' : diff_NPL_OS < 0 ? '#16a34a' : 'inherit', fontWeight: diff_NPL_OS > 0 ? 'bold' : 'normal' }}>
                      {diff_NPL_OS > 0 ? '+' : ''}{formatRupiah(diff_NPL_OS)}
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{formatPercent(p_NPL_Pct)}</td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{formatPercent(c_NPL_Pct)}</td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1', color: diff_NPL_Pct > 0 ? '#dc2626' : diff_NPL_Pct < 0 ? '#16a34a' : 'inherit', fontWeight: diff_NPL_Pct > 0 ? 'bold' : 'normal' }}>
                      {diff_NPL_Pct > 0 ? '+' : ''}{formatPercent(diff_NPL_Pct)}
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center', fontSize: '1.25rem' }}>{flag}</td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'left', backgroundColor: bgFlag, color: textFlag }}>
                      {recommendation}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>`;

    code = code.substring(0, sectionStart) + newSection + code.substring(sectionEnd);
    fs.writeFileSync('app/performa/kolektibilitas/page.tsx', code);
    console.log('Replaced AO comparison section successfully!');
} else {
    console.log('Could not find start index!');
}
