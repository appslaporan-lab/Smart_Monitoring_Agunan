const fs = require('fs');
let code = fs.readFileSync('components/ModuleSidebar.tsx', 'utf8');

code = code.replace(
  "{ href: '/kpi/teller/transaksi-harian', label: 'Teller (Transaksi Harian)', roles: 'all', icon: FileText, module: 'kpi' },",
  "{ href: '/kpi/teller/transaksi-harian', label: 'Teller (Transaksi Harian)', roles: 'all', icon: FileText, module: 'kpi' },\n  { href: '/kpi/teller/kesalahan', label: 'Daftar Kesalahan', roles: 'all', icon: ShieldCheck, module: 'kpi' },"
);

fs.writeFileSync('components/ModuleSidebar.tsx', code);
console.log('Sidebar error updated');
