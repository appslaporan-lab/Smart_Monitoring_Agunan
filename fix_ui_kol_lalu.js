const fs = require('fs');
let code = fs.readFileSync('app/collecting/pinjaman/[id]/page.tsx', 'utf8');

if (!code.includes('Kolektibilitas Bulan Lalu')) {
  const oldText = `<p>Kolektibilitas: {pinjaman.kdKolektibilitas || '-'}</p>`;
  const newText = `<p>Kolektibilitas: {pinjaman.kdKolektibilitas || '-'}</p>\n            <p>Kolektibilitas Bulan Lalu: {pinjaman.kdKolektibilitasLalu || '-'}</p>`;
  
  code = code.replace(oldText, newText);
  fs.writeFileSync('app/collecting/pinjaman/[id]/page.tsx', code);
}
console.log('UI updated with Kol Lalu');
