const fs = require('fs');
let code = fs.readFileSync('components/ModuleSidebar.tsx', 'utf8');

// Replace DIREKTUR with DIREKTUR, DIREKSI in all arrays
code = code.replace(/'DIREKTUR'/g, "'DIREKTUR', 'DIREKSI'");

fs.writeFileSync('components/ModuleSidebar.tsx', code);
console.log('Direksi added to Agunan roles');
