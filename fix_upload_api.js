const fs = require('fs');
let code = fs.readFileSync('app/api/collecting/upload-nominatif/route.ts', 'utf8');

if (!code.includes('kdKolektibilitasLalu: row.kdKolektibilitasLalu')) {
  code = code.replace("kdKolektibilitas: row.kdKolektibilitas,", "kdKolektibilitas: row.kdKolektibilitas,\n              kdKolektibilitasLalu: row.kdKolektibilitasLalu,");
  fs.writeFileSync('app/api/collecting/upload-nominatif/route.ts', code);
}
console.log('Upload API updated');
