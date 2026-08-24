const fs = require('fs');
let code = fs.readFileSync('prisma/schema.prisma', 'utf8');

if (!code.includes('activityLogs ActivityLog[]')) {
  code = code.replace("realisasiMo        RealisasiHarianMO[]\n}", "realisasiMo        RealisasiHarianMO[]\n  activityLogs       ActivityLog[]\n}");
  fs.writeFileSync('prisma/schema.prisma', code);
}
console.log('Relation added');
