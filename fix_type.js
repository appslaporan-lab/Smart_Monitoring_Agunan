const fs = require('fs');
let code = fs.readFileSync('app/performa/kolektibilitas/page.tsx', 'utf8');
code = code.replace("jenisUpload: 'PERFORMA'", "jenisUpload: 'PERFORM_KOLEKTIBILITAS'");
fs.writeFileSync('app/performa/kolektibilitas/page.tsx', code);
console.log('Fixed type');
