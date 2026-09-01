const fs = require('fs');

let code = fs.readFileSync('app/performa/kolektibilitas/page.tsx', 'utf8');

const oldMap = `const reportRows = rows.map((row) => {`;
const newMap = `const mapToReportRows = (dataRows: any[]) => dataRows.map((row: any) => {`;

if (code.includes(oldMap)) {
  code = code.replace(oldMap, newMap);
  
  const oldEnd = `collateralBucket: row.jenisJaminan || '(blank)',
    };
  });`;

  const newEnd = `collateralBucket: row.jenisJaminan || '(blank)',
    };
  });

  const reportRows = mapToReportRows(rows);
  const prevReportRows = mapToReportRows(prevRows);`;

  if (code.includes(oldEnd)) {
    code = code.replace(oldEnd, newEnd);
    fs.writeFileSync('app/performa/kolektibilitas/page.tsx', code);
    console.log('Wrapped reportRows into mapToReportRows');
  } else {
    console.log('Could not find end of map function');
  }
} else {
  console.log('Could not find reportRows map start');
}
