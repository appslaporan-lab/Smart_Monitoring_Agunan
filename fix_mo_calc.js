const fs = require('fs');
let code = fs.readFileSync('app/kpi/mo-realisasi/input/page.tsx', 'utf8');
code = code.replace("if (jenis === 'BARU') return nr;", "if (jenis !== 'TOP_UP') return nr;");
fs.writeFileSync('app/kpi/mo-realisasi/input/page.tsx', code);
