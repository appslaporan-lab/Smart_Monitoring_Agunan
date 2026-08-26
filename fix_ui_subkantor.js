const fs = require('fs');
let code = fs.readFileSync('app/collecting/pinjaman/[id]/page.tsx', 'utf8');

if (!code.includes('getSubKantorName')) {
  code = code.replace("getKantorLabel } from '@/lib/kantor';", "getKantorLabel, getSubKantorName } from '@/lib/kantor';");
  
  const oldText = `<p>Kantor: {getKantorLabel(pinjaman.subKantor)} (Sub: {pinjaman.subKantor || '-'})</p>`;
  const newText = `<p>Kantor: {getKantorLabel(pinjaman.subKantor)} ({getSubKantorName(pinjaman.subKantor)})</p>`;
  
  code = code.replace(oldText, newText);
  fs.writeFileSync('app/collecting/pinjaman/[id]/page.tsx', code);
}
console.log('Fixed UI subkantor');
