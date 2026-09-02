const fs = require('fs');
const path = 'app/admin/ao/page.tsx';
let code = fs.readFileSync(path, 'utf8');
code = code.replace(`if (!user || user.role !== 'SUPERADMIN') redirect('/');`, `if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'KASUBAG_REMEDIAL')) redirect('/');`);
fs.writeFileSync(path, code);
console.log('Patched');
