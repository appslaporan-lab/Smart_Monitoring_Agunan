const fs = require('fs');
const path = 'components/ModuleSidebar.tsx';
let code = fs.readFileSync(path, 'utf8');

const targets = [
    "href: '/collecting', label: 'Dashboard Collecting'",
    "href: '/performa/kolektibilitas', label: 'Laporan Kolektibilitas'",
    "href: '/performa', label: 'Dashboard Performa'",
    "href: '/admin/settings', label: 'Pengaturan Bucket'",
    "href: '/admin/ao', label: 'Mapping AO'"
];

const lines = code.split(/\r?\n/);
for (let i = 0; i < lines.length; i++) {
    for (const target of targets) {
        if (lines[i].includes(target)) {
            if (!lines[i].includes('KASUBAG_REMEDIAL')) {
                lines[i] = lines[i].replace(/roles: \[(.*?)\]/, (match, inner) => {
                    return 'roles: [' + inner + ',"KASUBAG_REMEDIAL"]';
                });
            }
        }
    }
}

fs.writeFileSync(path, lines.join('\n'));
console.log('Restored KASUBAG_REMEDIAL to sidebar');
