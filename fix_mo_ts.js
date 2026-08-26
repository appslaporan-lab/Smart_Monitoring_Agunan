const fs = require('fs');
let code = fs.readFileSync('app/kpi/mo-realisasi/input/page.tsx', 'utf8');

code = code.replace("useState<'BARU' | 'TOP_UP'>('BARU')", "useState<'NASABAH_BARU' | 'NASABAH_LAMA' | 'TOP_UP'>('NASABAH_BARU')");
code = code.replace("setJenis('BARU')", "setJenis('NASABAH_BARU')");

fs.writeFileSync('app/kpi/mo-realisasi/input/page.tsx', code);
