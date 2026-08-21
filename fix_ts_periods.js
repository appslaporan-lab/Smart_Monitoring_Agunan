const fs = require('fs');
let c1 = fs.readFileSync('app/collecting/page.tsx', 'utf8');
c1 = c1.replace("parseInt(searchParams.periodeId)", "parseInt(searchParams.periodeId as string)");
fs.writeFileSync('app/collecting/page.tsx', c1);

let c2 = fs.readFileSync('app/performa/kolektibilitas/page.tsx', 'utf8');
c2 = c2.replace("parseInt(searchParams.periodeId)", "parseInt(searchParams.periodeId as string)");
fs.writeFileSync('app/performa/kolektibilitas/page.tsx', c2);
console.log('Fixed TS periods');
