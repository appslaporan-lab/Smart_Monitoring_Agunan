const fs = require('fs');
let code = fs.readFileSync('components/ModuleSidebar.tsx', 'utf8');

code = code.replace(
  "{ href: '/kpi', label: 'Dashboard KPI', roles: 'all', icon: LayoutDashboard, module: 'kpi' },",
  "{ href: '/kpi', label: 'Dashboard KPI', roles: 'all', icon: LayoutDashboard, module: 'kpi' },\n  { href: '/kpi/teller/transaksi-harian', label: 'Teller (Transaksi Harian)', roles: 'all', icon: FileText, module: 'kpi' },"
);

fs.writeFileSync('components/ModuleSidebar.tsx', code);
console.log('Sidebar updated');
