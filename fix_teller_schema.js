const fs = require('fs');
let code = fs.readFileSync('prisma/schema.prisma', 'utf8');

if (!code.includes('sudahBayar')) {
  code = code.replace("kdKolektibilitasLalu String?", "kdKolektibilitasLalu String?\n  sudahBayar          Boolean  @default(false)\n  nominalBayarHariIni Float?   @default(0)");
  fs.writeFileSync('prisma/schema.prisma', code);
}
console.log('Schema updated');
