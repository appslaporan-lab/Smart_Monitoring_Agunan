const fs = require('fs');
let code = fs.readFileSync('components/ModuleSidebar.tsx', 'utf8');

code = code.replace(/"MARKETING","AO"/g, '"MARKETING","AO","MO"');

fs.writeFileSync('components/ModuleSidebar.tsx', code);
console.log('Added MO role to Sidebar');
