const fs = require('fs');

// layout.tsx
let layoutCode = fs.readFileSync('app/layout.tsx', 'utf8');
layoutCode = layoutCode.replace("title: 'BPR Suite',", "title: 'Smart Monitoring',");
fs.writeFileSync('app/layout.tsx', layoutCode);

// ModuleSidebar.tsx
let sidebarCode = fs.readFileSync('components/ModuleSidebar.tsx', 'utf8');
sidebarCode = sidebarCode.replace("BPR Suite", "Smart Monitoring");
fs.writeFileSync('components/ModuleSidebar.tsx', sidebarCode);

console.log('App name changed');
