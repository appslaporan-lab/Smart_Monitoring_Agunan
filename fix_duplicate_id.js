const fs = require('fs');
let code = fs.readFileSync('app/kpi/mo-realisasi/page.tsx', 'utf8');

code = code.replace('<table id="table-ranking-mo" id="table-recon-mo" className="table"', '<table id="table-ranking-mo" className="table"');
code = code.replace('<table className="table"', '<table id="table-recon-mo" className="table"');

fs.writeFileSync('app/kpi/mo-realisasi/page.tsx', code);
console.log('Fixed IDs');
