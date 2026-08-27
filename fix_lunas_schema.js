const fs = require('fs');
let code = fs.readFileSync('prisma/schema.prisma', 'utf8');

if (!code.includes('isLunas')) {
  code = code.replace("sudahBayar          Boolean  @default(false)", "sudahBayar          Boolean  @default(false)\n  isLunas             Boolean  @default(false)");
  fs.writeFileSync('prisma/schema.prisma', code);
}
console.log('Schema updated for lunas');
