const fs = require('fs');
const path = 'app/collecting/page.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/\{\(user\.role === 'SUPERADMIN' \|\| user\.role === 'KASUBAG_REMEDIAL'\) && \(/g, `{user.role === 'SUPERADMIN' && (`);
fs.writeFileSync(path, code);
console.log('Fixed button in page');
