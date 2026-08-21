const fs = require('fs');
let code = fs.readFileSync('app/performa/kolektibilitas/page.tsx', 'utf8');

code = code.replace(
  "return aoMap.get(raw) || raw;",
  "return (aoMap.get(raw) || raw).toUpperCase();"
);

fs.writeFileSync('app/performa/kolektibilitas/page.tsx', code);
console.log('AO uppercase fixed');
