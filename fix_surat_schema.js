const fs = require('fs');
let code = fs.readFileSync('prisma/schema.prisma', 'utf8');

if (!code.includes('penerimaSurat')) {
  code = code.replace("catatan           String?", "catatan           String?\n  penerimaSurat     String?");
  fs.writeFileSync('prisma/schema.prisma', code);
  console.log('penerimaSurat added to schema');
}
