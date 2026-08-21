const fs = require('fs');
let code = fs.readFileSync('app/kpi/teller/transaksi-harian/page.tsx', 'utf8');

code = code.replace(
  /result\.pencairan\.total/g,
  "result.pencairanPinjaman.total"
);
code = code.replace(
  /result\.pencairan\.count/g,
  "result.pencairanPinjaman.count"
);

fs.writeFileSync('app/kpi/teller/transaksi-harian/page.tsx', code);
console.log('UI updated');
