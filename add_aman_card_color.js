const fs = require('fs');
let code = fs.readFileSync('app/collecting/CollectingDebiturList.tsx', 'utf8');

code = code.replace("const cardColors: Record<string, string> = {", "const cardColors: Record<string, string> = {\n    AMAN: '#10b981',"); // emerald green

fs.writeFileSync('app/collecting/CollectingDebiturList.tsx', code);
console.log('Added AMAN to cardColors');
