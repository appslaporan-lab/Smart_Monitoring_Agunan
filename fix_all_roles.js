const fs = require('fs');
let code = fs.readFileSync('components/ModuleSidebar.tsx', 'utf8');

const kpiGeneralRoles = [
  'TELLER', 'MARKETING', 'AO', 'ADM_KREDIT', 'CS', 
  'KEPALA_KAS', 'KASUBAG_OPERASIONAL', 'KASUBAG_PUSAT', 'KASUBAG_CABANG', 
  'KASUBAG_KREDIT', 'KASUBAG_KREDIT_PUSAT_1', 'KASUBAG_KREDIT_PUSAT_2', 'KASUBAG_KREDIT_CABANG',
  'KABAG_OPERASIONAL', 'KABAG_MARKETING', 'KABAG_MARKETING_PUSAT_1', 'KABAG_MARKETING_PUSAT_2',
  'PIMPINAN_CABANG', 'DIREKSI', 'DIREKTUR', 'SUPERADMIN'
];

const collectingRoles = [
  'MARKETING', 'AO', 'KEPALA_KAS', 
  'KASUBAG_KREDIT', 'KASUBAG_KREDIT_PUSAT_1', 'KASUBAG_KREDIT_PUSAT_2', 'KASUBAG_KREDIT_CABANG',
  'KABAG_MARKETING', 'KABAG_MARKETING_PUSAT_1', 'KABAG_MARKETING_PUSAT_2',
  'PIMPINAN_CABANG', 'DIREKSI', 'DIREKTUR', 'SUPERADMIN'
];

const performaRoles = [
  'KEPALA_KAS', 'KASUBAG_KREDIT', 'KASUBAG_KREDIT_PUSAT_1', 'KASUBAG_KREDIT_PUSAT_2', 'KASUBAG_KREDIT_CABANG',
  'KABAG_MARKETING', 'KABAG_MARKETING_PUSAT_1', 'KABAG_MARKETING_PUSAT_2',
  'KABAG_OPERASIONAL', 'PIMPINAN_CABANG', 'DIREKSI', 'DIREKTUR', 'SUPERADMIN'
];

// Replace Collecting Dashboard
code = code.replace(
  "{ href: '/collecting', label: 'Dashboard Collecting', roles: 'all', icon: LayoutDashboard, module: 'collecting' },",
  `{ href: '/collecting', label: 'Dashboard Collecting', roles: ${JSON.stringify(collectingRoles)}, icon: LayoutDashboard, module: 'collecting' },`
);

// Replace KPI Dashboard
code = code.replace(
  "{ href: '/kpi', label: 'Dashboard KPI', roles: 'all', icon: LayoutDashboard, module: 'kpi' },",
  `{ href: '/kpi', label: 'Dashboard KPI', roles: ${JSON.stringify(kpiGeneralRoles)}, icon: LayoutDashboard, module: 'kpi' },`
);

// Replace Performa Karyawan
code = code.replace(
  "{ href: '/kpi/performa-karyawan', label: 'Performa Karyawan', roles: 'all', icon: Users, module: 'kpi' },",
  `{ href: '/kpi/performa-karyawan', label: 'Performa Karyawan', roles: ${JSON.stringify(kpiGeneralRoles)}, icon: Users, module: 'kpi' },`
);

// Replace Dashboard Performa
code = code.replace(
  "{ href: '/performa', label: 'Dashboard Performa', roles: 'all', icon: LayoutDashboard, module: 'performa' },",
  `{ href: '/performa', label: 'Dashboard Performa', roles: ${JSON.stringify(performaRoles)}, icon: LayoutDashboard, module: 'performa' },`
);

fs.writeFileSync('components/ModuleSidebar.tsx', code);
console.log('Sidebar full roles updated');
