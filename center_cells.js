const fs = require('fs');
const path = 'app/kpi/teller/kesalahan/page.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('{r.jumlah > 0 ? (')) {
        // center the td above it if it doesn't have it
        if (!lines[i-1].includes('textAlign')) {
            lines[i-1] = lines[i-1].replace(`padding: '12px 16px'`, `padding: '12px 16px', textAlign: 'center'`);
        }
    }
}

fs.writeFileSync(path, lines.join('\n'));
console.log('Centered cells');
