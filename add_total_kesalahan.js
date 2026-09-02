const fs = require('fs');
const path = 'app/kpi/teller/kesalahan/page.tsx';
let code = fs.readFileSync(path, 'utf8');

const fetchBlock = `const records = await prisma.rekapKesalahanTeller.findMany({`;
const newFetchBlock = `// Fetch total harian from performa
  const performaData = await prisma.performaKaryawan.findMany({
    where: {
      tanggal: {
        gte: startDate,
        lte: endDate,
      }
    }
  });

  const performaTotals: Record<string, number> = {};
  for (const p of performaData) {
    const key = \`\${p.userId}-\${new Date(p.tanggal).toISOString()}\`;
    if (!performaTotals[key]) performaTotals[key] = 0;
    performaTotals[key] += p.jumlahKegiatan;
  }

  const records = await prisma.rekapKesalahanTeller.findMany({`;

code = code.replace(fetchBlock, newFetchBlock);

const headerOld = `<th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px 16px' }}>Nama Teller</th>
                  <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px 16px' }}>Jumlah Transaksi Minus</th>`;
const headerNew = `<th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px 16px' }}>Nama Teller</th>
                  <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px 16px', textAlign: 'center' }}>Total Harian</th>
                  <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px 16px' }}>Jumlah Transaksi Minus</th>`;

code = code.replace(headerOld, headerNew);

const mapOld = `{records.map(r => (
                  <tr key={r.id}>
                    <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px 16px' }}>
                      {new Date(r.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </td>
                    <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px 16px', fontWeight: 500 }}>{r.user.nama}</td>
                    <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px 16px' }}>`;

const mapNew = `{records.map(r => {
                  const key = \`\${r.userId}-\${new Date(r.tanggal).toISOString()}\`;
                  const totalHarian = performaTotals[key] || 0;
                  return (
                  <tr key={r.id}>
                    <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px 16px' }}>
                      {new Date(r.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </td>
                    <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px 16px', fontWeight: 500 }}>{r.user.nama}</td>
                    <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{ fontWeight: 600, color: '#3b82f6', background: '#eff6ff', padding: '4px 8px', borderRadius: 12, fontSize: 13 }}>{totalHarian}</span>
                    </td>
                    <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px 16px' }}>`;

code = code.replace(mapOld, mapNew);

const mapEndOld = `</tr>
                ))}
              </tbody>`;
const mapEndNew = `</tr>
                )})}
              </tbody>`;

code = code.replace(mapEndOld, mapEndNew);

fs.writeFileSync(path, code);
console.log('Modified teller kesalahan page');
