const fs = require('fs');
let code = fs.readFileSync('app/MasterDashboardCharts.tsx', 'utf8');
code = code.replace("key={\\`cell-\\${index}\\`}", "key={'cell-' + index}");
fs.writeFileSync('app/MasterDashboardCharts.tsx', code);
