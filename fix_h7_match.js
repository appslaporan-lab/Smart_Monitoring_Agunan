const fs = require('fs');

const path = 'app/collecting/CollectingDebiturList.tsx';
let code = fs.readFileSync(path, 'utf8');

const oldMatch = `{ key: 'H7_DESK_CALL', label: 'H-7 Desk Call', match: (i) => i.ews.status === 'H7_DESK_CALL' },`;
const newMatch = `{ key: 'H7_DESK_CALL', label: 'H-7 Desk Call', match: (i) => i.ews.status === 'H7_DESK_CALL' && !i.isLunas && !i.sudahBayar },`;

if (code.includes(oldMatch)) {
    code = code.replace(oldMatch, newMatch);
    fs.writeFileSync(path, code);
    console.log('Fixed H7_DESK_CALL match logic');
} else {
    console.log('Could not find H7_DESK_CALL match logic');
}
