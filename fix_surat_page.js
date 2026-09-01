const fs = require('fs');
let code = fs.readFileSync('app/collecting/pinjaman/[id]/page.tsx', 'utf8');

const oldRender = `{k.catatan && <p style={{ margin: '4px 0' }}>Catatan: {k.catatan}</p>}`;
const newRender = `{k.penerimaSurat && <p style={{ margin: '4px 0' }}>Diterima Oleh: <strong>{k.penerimaSurat}</strong></p>}\n                  {k.catatan && <p style={{ margin: '4px 0' }}>Catatan: {k.catatan}</p>}`;

code = code.replace(oldRender, newRender);
fs.writeFileSync('app/collecting/pinjaman/[id]/page.tsx', code);
console.log('page.tsx updated');
