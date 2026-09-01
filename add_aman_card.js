const fs = require('fs');
let code = fs.readFileSync('app/collecting/CollectingDebiturList.tsx', 'utf8');

const oldFilters = `{ key: 'JANJI_BAYAR_DEKAT', label: 'Mendekati Janji Bayar', match: (i) => i.ews.status === 'JANJI_BAYAR_DEKAT' },`;
const newFilters = `{ key: 'AMAN', label: 'Aman (Lancar)', match: (i) => i.ews.status === 'AMAN' && !i.isLunas && !i.sudahBayar },\n    { key: 'JANJI_BAYAR_DEKAT', label: 'Mendekati Janji Bayar', match: (i) => i.ews.status === 'JANJI_BAYAR_DEKAT' },`;

if (code.includes(oldFilters)) {
  code = code.replace(oldFilters, newFilters);
  fs.writeFileSync('app/collecting/CollectingDebiturList.tsx', code);
  console.log('Added AMAN card');
} else {
  console.log('Target string not found');
}
