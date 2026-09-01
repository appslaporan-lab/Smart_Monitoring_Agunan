const fs = require('fs');
let code = fs.readFileSync('app/performa/kolektibilitas/page.tsx', 'utf8');

code = code.replace("table-layout: fixed;", "");

fs.writeFileSync('app/performa/kolektibilitas/page.tsx', code);
console.log('Fixed table layout');
