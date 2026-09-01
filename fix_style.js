const fs = require('fs');
let code = fs.readFileSync('app/performa/kolektibilitas/page.tsx', 'utf8');

code = code.replace("table th { background-color: #e2e8f0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }", "table { -webkit-print-color-adjust: exact; print-color-adjust: exact; }");
// wait, I also targeted specific headers. They have inline styles, so `table { ... }` is enough to print the inline styles of all cells.

fs.writeFileSync('app/performa/kolektibilitas/page.tsx', code);
console.log('Fixed style injection');
