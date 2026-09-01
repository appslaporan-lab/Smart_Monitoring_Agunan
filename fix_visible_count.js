const fs = require('fs');
let code = fs.readFileSync('app/collecting/page.tsx', 'utf8');

code = code.replace(
  "<p style={{ marginTop: 8 }}>Total {pinjamans.length} debitur (Data +{daysToAdd} Hari)</p>",
  "<p style={{ marginTop: 8 }}>Total {visiblePinjamans.length} debitur (Data +{daysToAdd} Hari)</p>"
);

fs.writeFileSync('app/collecting/page.tsx', code);
console.log('Fixed visiblePinjamans count');
