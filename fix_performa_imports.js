const fs = require('fs');
let code = fs.readFileSync('app/performa/kolektibilitas/page.tsx', 'utf8');

code = code.replace(
  "import { getKantorGroup } from '@/lib/kantor';", 
  "import { getKantorGroup, canAccessKantorData } from '@/lib/kantor';"
);

fs.writeFileSync('app/performa/kolektibilitas/page.tsx', code);
console.log('Fixed import');
