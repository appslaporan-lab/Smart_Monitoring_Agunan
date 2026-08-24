const fs = require('fs');
let code = fs.readFileSync('components/ModuleSidebar.tsx', 'utf8');

if (!code.includes('/kpi/mo-realisasi')) {
  code = code.replace(
    "{ href: '/kpi/performa-karyawan', label: 'Performa Karyawan', roles: 'all', icon: Users, module: 'kpi' },",
    "{ href: '/kpi/performa-karyawan', label: 'Performa Karyawan', roles: 'all', icon: Users, module: 'kpi' },\n  { href: '/kpi/mo-realisasi', label: 'MO (Realisasi)', roles: 'all', icon: Trophy, module: 'kpi' },"
  );
  
  if (!code.includes('Trophy')) {
    code = code.replace("import {", "import { Trophy,");
  }

  fs.writeFileSync('components/ModuleSidebar.tsx', code);
  console.log('Sidebar MO updated');
}
