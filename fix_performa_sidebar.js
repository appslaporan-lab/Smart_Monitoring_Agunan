const fs = require('fs');
let code = fs.readFileSync('components/ModuleSidebar.tsx', 'utf8');

const oldSidebar = `{ href: '/performa/kolektibilitas', label: 'Laporan Kolektibilitas', roles: ['SUPERADMIN', 'KASUBAG_KREDIT_PUSAT_1', 'KASUBAG_KREDIT_PUSAT_2', 'KASUBAG_KREDIT_CABANG', 'KABAG_MARKETING_PUSAT_1', 'KABAG_MARKETING_PUSAT_2', 'PIMPINAN_CABANG', 'DIREKTUR', 'DIREKSI', 'KABAG_OPERASIONAL'], icon: FileText, module: 'performa' },`;

const newSidebar = `{ href: '/performa/kolektibilitas', label: 'Laporan Kolektibilitas', roles: ['SUPERADMIN', 'KASUBAG_KREDIT_PUSAT_1', 'KASUBAG_KREDIT_PUSAT_2', 'KASUBAG_KREDIT_CABANG', 'KABAG_MARKETING_PUSAT_1', 'KABAG_MARKETING_PUSAT_2', 'PIMPINAN_CABANG', 'DIREKTUR', 'DIREKSI', 'KABAG_OPERASIONAL', 'KEPALA_KAS', 'KASUBAG_PUSAT', 'KASUBAG_CABANG'], icon: FileText, module: 'performa' },`;

if (code.includes(oldSidebar)) {
  code = code.replace(oldSidebar, newSidebar);
  fs.writeFileSync('components/ModuleSidebar.tsx', code);
  console.log('Fixed ModuleSidebar performa roles');
} else {
  console.log('Target string not found in ModuleSidebar');
}
