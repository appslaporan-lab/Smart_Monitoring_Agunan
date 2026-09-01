const fs = require('fs');

let code = fs.readFileSync('app/performa/kolektibilitas/page.tsx', 'utf8');

code = code.replace(/const reportRows = rows\.map\(\(row\) => \{/g, 'const mapToReportRows = (dataRows: any[]) => dataRows.map((row: any) => {');

code = code.replace(/collateralBucket: row\.jenisJaminan \|\| '\(blank\)',\s*\};\s*\}\);/g, `collateralBucket: row.jenisJaminan || '(blank)',
      };
    });

    const reportRows = mapToReportRows(rows);
    const prevReportRows = mapToReportRows(prevRows);`);

fs.writeFileSync('app/performa/kolektibilitas/page.tsx', code);
console.log('Wrapped reportRows into mapToReportRows via regex');
