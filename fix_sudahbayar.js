const fs = require('fs');
const path = 'app/collecting/CollectingDebiturList.tsx';
let code = fs.readFileSync(path, 'utf8');

const oldMatch = `{ key: 'SUDAH_BAYAR', label: 'Sudah Bayar', match: (i) => i.sudahBayar },`;
const newMatch = `{ key: 'SUDAH_BAYAR', label: 'Sudah Bayar', match: (i) => i.sudahBayar && !i.isLunas },`;

if (code.includes(oldMatch)) {
    code = code.replace(oldMatch, newMatch);
    fs.writeFileSync(path, code);
    console.log('Fixed SUDAH_BAYAR exclusion');
} else {
    console.log('Could not find SUDAH_BAYAR match');
}
