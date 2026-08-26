const fs = require('fs');
let code = fs.readFileSync('prisma/schema.prisma', 'utf8');

if (!code.includes('kdKolektibilitasLalu')) {
  code = code.replace("kdKolektibilitas    String?", "kdKolektibilitas    String?\n  kdKolektibilitasLalu String?");
  fs.writeFileSync('prisma/schema.prisma', code);
}
console.log('Schema updated');
