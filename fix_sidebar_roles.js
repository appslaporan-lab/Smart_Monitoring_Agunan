const fs = require('fs');
let code = fs.readFileSync('components/ModuleSidebar.tsx', 'utf8');

const tellerHierarchy = ['TELLER', 'KEPALA_KAS', 'KASUBAG_OPERASIONAL', 'KASUBAG_PUSAT', 'KASUBAG_CABANG', 'KABAG_OPERASIONAL', 'PIMPINAN_CABANG', 'DIREKSI', 'DIREKTUR', 'SUPERADMIN'];
const moHierarchy = ['MARKETING', 'AO', 'KEPALA_KAS', 'KASUBAG_KREDIT', 'KASUBAG_KREDIT_PUSAT_1', 'KASUBAG_KREDIT_PUSAT_2', 'KASUBAG_KREDIT_CABANG', 'KABAG_MARKETING', 'PIMPINAN_CABANG', 'DIREKSI', 'DIREKTUR', 'SUPERADMIN'];
const csHierarchy = ['CS', 'KEPALA_KAS', 'KASUBAG_OPERASIONAL', 'KASUBAG_PUSAT', 'KASUBAG_CABANG', 'KABAG_OPERASIONAL', 'PIMPINAN_CABANG', 'DIREKSI', 'DIREKTUR', 'SUPERADMIN'];

code = code.replace(
  "{ href: '/kpi/teller/transaksi-harian', label: 'Teller (Transaksi Harian)', roles: 'all', icon: FileText, module: 'kpi' },",
  `{ href: '/kpi/teller/transaksi-harian', label: 'Teller (Transaksi Harian)', roles: ${JSON.stringify(tellerHierarchy)}, icon: FileText, module: 'kpi' },`
);

code = code.replace(
  "{ href: '/kpi/teller/kesalahan', label: 'Daftar Kesalahan', roles: 'all', icon: ShieldCheck, module: 'kpi' },",
  `{ href: '/kpi/teller/kesalahan', label: 'Daftar Kesalahan', roles: ${JSON.stringify(tellerHierarchy)}, icon: ShieldCheck, module: 'kpi' },`
);

code = code.replace(
  "{ href: '/kpi/mo-realisasi', label: 'MO (Realisasi)', roles: 'all', icon: Trophy, module: 'kpi' },",
  `{ href: '/kpi/mo-realisasi', label: 'MO (Realisasi)', roles: ${JSON.stringify(moHierarchy)}, icon: Trophy, module: 'kpi' },`
);

fs.writeFileSync('components/ModuleSidebar.tsx', code);
console.log('Sidebar Roles updated');
