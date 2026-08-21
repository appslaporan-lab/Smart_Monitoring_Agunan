const fs = require('fs');

let code = fs.readFileSync('app/performa/kolektibilitas/page.tsx', 'utf8');

code = code.replace(
  "productBucket: row.produkKredit || '(blank)',",
  "productBucket: row.produkKredit || '(blank)',\n      sektorBucket: row.sektorEkonomi || 'LAIN-LAIN',"
);

code = code.replace(
  "const productSummary = buildDetailedSummary('productBucket');",
  "const productSummary = buildDetailedSummary('productBucket');\n  const sektorSummary = buildDetailedSummary('sektorBucket');"
);

code = code.replace(
  "{renderDetailedSummaryTable('TYPE KREDIT', productSummary)}",
  "{renderDetailedSummaryTable('TYPE KREDIT', productSummary)}\n      {renderDetailedSummaryTable('SEKTOR USAHA', sektorSummary)}"
);

fs.writeFileSync('app/performa/kolektibilitas/page.tsx', code);
console.log('Sektor Usaha added');
