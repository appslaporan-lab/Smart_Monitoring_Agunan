const fs = require('fs');
let code = fs.readFileSync('components/ModuleSidebar.tsx', 'utf8');

const targetLineStart = `{ href: '/collecting', label: 'Dashboard Collecting', roles: ["MARKETING"`;

if (code.includes(targetLineStart)) {
  code = code.replace(`roles: ["MARKETING"`, `roles: ["TELLER","MARKETING"`);
  fs.writeFileSync('components/ModuleSidebar.tsx', code);
  console.log('Added TELLER to Collecting Dashboard');
} else {
  console.log('Target line not found');
}
