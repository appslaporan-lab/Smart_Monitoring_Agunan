const fs = require('fs');

let apiCode = fs.readFileSync('app/api/collecting/upload-teller/route.ts', 'utf8');
apiCode = apiCode.replace("match(/\\\\b\\\\d{10}\\\\b/g)", "match(/\\b\\d{10}\\b/g)");
fs.writeFileSync('app/api/collecting/upload-teller/route.ts', apiCode);

console.log('Fixed regex');
