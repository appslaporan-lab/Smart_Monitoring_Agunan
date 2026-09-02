const fs = require('fs');

const path = 'app/kpi/mo-realisasi/page.tsx';
let code = fs.readFileSync(path, 'utf8');

const oldCheck = `if (user.role === 'SUPERADMIN' || user.role === 'DIREKSI') {`;
const newCheck = `if (user.role === 'SUPERADMIN' || user.role === 'DIREKSI' || user.role === 'DIREKTUR') {`;

if (code.includes(oldCheck)) {
  code = code.replace(oldCheck, newCheck);
  fs.writeFileSync(path, code);
  console.log('Fixed DIREKTUR in mo-realisasi');
} else {
  console.log('Could not find check in mo-realisasi');
}
