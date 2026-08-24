const fs = require('fs');
let code = fs.readFileSync('app/kpi/mo-realisasi/page.tsx', 'utf8');

// Update interface
code = code.replace(
  "const moStats: Record<number, { nama: string; total: number; subKantor: string }> = {};",
  "const moStats: Record<number, { nama: string; total: number; count: number; subKantor: string }> = {};"
);

// Update initialization
code = code.replace(
  "moStats[r.userId] = { nama: r.user.nama, subKantor: r.user.subKantor || 'Pusat', total: 0 };",
  "moStats[r.userId] = { nama: r.user.nama, subKantor: r.user.subKantor || 'Pusat', total: 0, count: 0 };"
);

// Update increment
code = code.replace(
  "moStats[r.userId].total += r.nominal;",
  "moStats[r.userId].total += r.nominal;\n    moStats[r.userId].count += 1;"
);

// Add table header
code = code.replace(
  "<th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px' }}>Kantor</th>",
  "<th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px' }}>Kantor</th>\n                  <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px', textAlign: 'center' }}>Jml Nasabah</th>"
);

// Add table cell
code = code.replace(
  "<td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px' }}>{mo.subKantor}</td>",
  "<td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px' }}>{mo.subKantor}</td>\n                      <td style={{ borderBottom: '1px solid #f1f5f9', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>{mo.count}</td>"
);

fs.writeFileSync('app/kpi/mo-realisasi/page.tsx', code);
console.log('Count added');
