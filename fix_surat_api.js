const fs = require('fs');
let code = fs.readFileSync('app/api/collecting/kunjungan/route.ts', 'utf8');

code = code.replace("fotoDataUrl } = body;", "fotoDataUrl, penerimaSurat } = body;");
code = code.replace("fotoDataUrl: fotoDataUrl || null,", "fotoDataUrl: fotoDataUrl || null,\n        penerimaSurat: penerimaSurat || null,");

fs.writeFileSync('app/api/collecting/kunjungan/route.ts', code);
console.log('API route updated');
