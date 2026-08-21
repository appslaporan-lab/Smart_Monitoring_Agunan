const fs = require('fs');
let code = fs.readFileSync('components/ModuleSidebar.tsx', 'utf8');

code = code.replace(
  "{ href: '/kpi/teller/kesalahan', label: 'Daftar Kesalahan', roles: 'all', icon: ShieldCheck, module: 'kpi' },",
  "{ href: '/kpi/teller/kesalahan', label: 'Daftar Kesalahan', roles: 'all', icon: ShieldCheck, module: 'kpi' },\n  { href: '/kpi/performa-karyawan', label: 'Performa Karyawan', roles: 'all', icon: Users, module: 'kpi' },"
);

fs.writeFileSync('components/ModuleSidebar.tsx', code);
console.log('Sidebar performa updated');
