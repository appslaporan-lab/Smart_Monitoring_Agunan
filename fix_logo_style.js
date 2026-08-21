const fs = require('fs');
let loginCode = fs.readFileSync('app/auth/login/page.tsx', 'utf8');
loginCode = loginCode.replace(
  "style={{ background: 'transparent', padding: 0, boxShadow: 'none' }}",
  "style={{ background: 'transparent', padding: 0, boxShadow: 'none', width: 'auto', height: 'auto', display: 'inline-block' }}"
);
fs.writeFileSync('app/auth/login/page.tsx', loginCode);
console.log('Logo style fixed');
