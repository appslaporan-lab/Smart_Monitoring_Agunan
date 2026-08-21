const fs = require('fs');
const path = './prisma/schema.prisma';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /stepDisetujui\s+PengajuanStep\[\]\s+@relation\("StepDisetujui"\)\s*\}/,
  "stepDisetujui      PengajuanStep[]   @relation(\"StepDisetujui\")\n  kesalahanTeller    RekapKesalahanTeller[]\n}"
);

fs.writeFileSync(path, code);
