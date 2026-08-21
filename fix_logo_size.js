const fs = require('fs');

let loginCode = fs.readFileSync('app/auth/login/page.tsx', 'utf8');
loginCode = loginCode.replace("width: '100px'", "width: '320px'");
fs.writeFileSync('app/auth/login/page.tsx', loginCode);

let sidebarCode = fs.readFileSync('components/ModuleSidebar.tsx', 'utf8');
sidebarCode = sidebarCode.replace("width: '28px'", "width: '50px'");
fs.writeFileSync('components/ModuleSidebar.tsx', sidebarCode);

console.log('Logo size updated');
