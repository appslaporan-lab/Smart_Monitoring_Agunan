const fs = require('fs');
const path = 'app/api/collecting/upload-teller/route.ts';
let code = fs.readFileSync(path, 'utf8');
code = code.replace(`if (!user || user.role !== 'SUPERADMIN') {`, `if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'KASUBAG_REMEDIAL')) {`);
fs.writeFileSync(path, code);
console.log('Patched');
