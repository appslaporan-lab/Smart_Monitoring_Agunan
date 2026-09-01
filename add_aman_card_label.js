const fs = require('fs');
let code = fs.readFileSync('app/collecting/CollectingDebiturList.tsx', 'utf8');

code = code.replace("const cardLabels: Record<string, string> = {", "const cardLabels: Record<string, string> = {\n    AMAN: 'Aman (Lancar)',");

fs.writeFileSync('app/collecting/CollectingDebiturList.tsx', code);
console.log('Added AMAN to cardLabels');
