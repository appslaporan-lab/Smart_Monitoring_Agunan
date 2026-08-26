const fs = require('fs');
let code = fs.readFileSync('lib/excelParser.ts', 'utf8');

if (!code.includes('kdKolektibilitasLalu')) {
  // Add to ParsedRow type
  code = code.replace("kdKolektibilitas: string | null;", "kdKolektibilitas: string | null;\n  kdKolektibilitasLalu: string | null;");
  
  // Add to parse logic
  code = code.replace("kdKolektibilitas: row['P'] ? String(row['P']).trim() : null,", "kdKolektibilitas: row['P'] ? String(row['P']).trim() : null,\n      kdKolektibilitasLalu: row['Q'] ? String(row['Q']).trim() : null,");
  
  fs.writeFileSync('lib/excelParser.ts', code);
}
console.log('Parser updated for Kol Lalu');
