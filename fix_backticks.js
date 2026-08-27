const fs = require('fs');

let apiCode = fs.readFileSync('app/api/collecting/upload-teller/route.ts', 'utf8');
apiCode = apiCode.replace(/\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync('app/api/collecting/upload-teller/route.ts', apiCode);

let pageCode = fs.readFileSync('app/collecting/upload-teller/page.tsx', 'utf8');
pageCode = pageCode.replace(/\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync('app/collecting/upload-teller/page.tsx', pageCode);

console.log('Fixed backticks');
