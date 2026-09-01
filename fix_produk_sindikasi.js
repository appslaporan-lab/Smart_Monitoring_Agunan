const fs = require('fs');
let code = fs.readFileSync('app/performa/kolektibilitas/page.tsx', 'utf8');

const oldLine = `productBucket: row.produkKredit || '(blank)',`;
const newLine = `productBucket: (row.produkKredit === '19.3' ? 'Kredit Sindikasi' : row.produkKredit) || '(blank)',`;

if (code.includes(oldLine)) {
  code = code.replace(oldLine, newLine);
  fs.writeFileSync('app/performa/kolektibilitas/page.tsx', code);
  console.log('Fixed produkKredit 19.3');
} else {
  console.log('Line not found');
}
