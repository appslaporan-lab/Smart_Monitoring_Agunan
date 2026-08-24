const fs = require('fs');
let code = fs.readFileSync('app/kpi/performa-karyawan/page.tsx', 'utf8');

// Change the where clause
code = code.replace(
  /where: \{\s*userId: user\.id\s*\}/,
  "where: user.role === 'SUPERADMIN' ? {} : { userId: user.id }"
);

// Change the title
code = code.replace(
  /<h2 style=\{\{ margin: 0 \}\}>Riwayat Kegiatan \(Pribadi\)<\/h2>/,
  "<h2 style={{ margin: 0 }}>Riwayat Kegiatan {user.role === 'SUPERADMIN' ? '(Semua Karyawan)' : '(Pribadi)'}</h2>"
);

fs.writeFileSync('app/kpi/performa-karyawan/page.tsx', code);
console.log('Performa view updated');
