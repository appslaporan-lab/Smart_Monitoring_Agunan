const fs = require('fs');
const path = './prisma/schema.prisma';
let code = fs.readFileSync(path, 'utf8');

// I accidentally replaced @@unique on RekapKesalahanTeller. Let's fix that!
// Find RekapKesalahanTeller and fix it
code = code.replace(
  /model RekapKesalahanTeller \{([\s\S]*?)@@unique\(\[userId, tanggal, kegiatan\]\)/,
  "model RekapKesalahanTeller {$1@@unique([userId, tanggal])"
);

// Ensure PerformaKaryawan has the correct one
code = code.replace(
  /model PerformaKaryawan \{([\s\S]*?)@@unique\(\[userId, tanggal\]\)/,
  "model PerformaKaryawan {$1@@unique([userId, tanggal, kegiatan])"
);

fs.writeFileSync(path, code);
console.log('Schema fixed.');
