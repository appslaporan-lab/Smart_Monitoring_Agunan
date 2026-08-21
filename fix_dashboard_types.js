const fs = require('fs');
let code1 = fs.readFileSync('app/page.tsx', 'utf8');

code1 = code1.replace("select: { kol: true, isNpl: true, outstanding: true, subKantor: true }", "select: { kdKolektibilitas: true, outstanding: true, subKantor: true }");
code1 = code1.replace("if (p.isNpl) grouped[label].npl += p.outstanding;\n      else grouped[label].nonNpl += p.outstanding;", "const isNpl = p.kdKolektibilitas && parseInt(p.kdKolektibilitas) >= 3;\n      if (isNpl) grouped[label].npl += p.outstanding || 0;\n      else grouped[label].nonNpl += p.outstanding || 0;");

fs.writeFileSync('app/page.tsx', code1);

let code2 = fs.readFileSync('app/MasterDashboardCharts.tsx', 'utf8');
code2 = code2.replace("formatter={(v: number) =>", "formatter={(v: any) =>");
fs.writeFileSync('app/MasterDashboardCharts.tsx', code2);

console.log('Fixed dashboard types');
