const fs = require('fs');
let code = fs.readFileSync('components/ModuleSidebar.tsx', 'utf8');

code = code.replace(
  "import {\n  LogOut",
  "import {\n  LogOut, Trophy"
);

fs.writeFileSync('components/ModuleSidebar.tsx', code);
console.log('Fixed import');
