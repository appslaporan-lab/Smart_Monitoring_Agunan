const fs = require('fs');
const path = 'app/kpi/performa-karyawan/page.tsx';
let code = fs.readFileSync(path, 'utf8');

const oldCheck = `where: user.role === 'SUPERADMIN' ? {} : { userId: user.id },`;
const newCheck = `where: (user.role === 'SUPERADMIN' || user.role === 'DIREKSI' || user.role === 'DIREKTUR') ? {} : { userId: user.id },`;

const oldTitle = `{user.role === 'SUPERADMIN' ? '(Semua Karyawan)' : '(Pribadi)'}`;
const newTitle = `{(user.role === 'SUPERADMIN' || user.role === 'DIREKSI' || user.role === 'DIREKTUR') ? '(Semua Karyawan)' : '(Pribadi)'}`;

if (code.includes(oldCheck)) {
    code = code.replace(oldCheck, newCheck);
    code = code.replace(oldTitle, newTitle);
    fs.writeFileSync(path, code);
    console.log('Fixed DIREKTUR in performa-karyawan');
} else {
    console.log('Could not find check in performa-karyawan');
}
