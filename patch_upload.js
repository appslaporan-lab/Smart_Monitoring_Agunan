const fs = require('fs');
const path = 'app/collecting/upload/page.tsx';
let code = fs.readFileSync(path, 'utf8');
code = code.replace(`if (user.role !== 'SUPERADMIN') redirect('/collecting');`, `if (user.role !== 'SUPERADMIN' && user.role !== 'KASUBAG_REMEDIAL') redirect('/collecting');`);
fs.writeFileSync(path, code);
console.log('Patched');
