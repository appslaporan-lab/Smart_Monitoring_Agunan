const fs = require('fs');
let code = fs.readFileSync('app/performa/kolektibilitas/page.tsx', 'utf8');

if (!code.includes('estimateJarakKantor')) {
  code = code.replace("import { COLLECTING_REPORT_CONFIG", "import { estimateJarakKantor } from '@/lib/mappingUtils';\nimport { COLLECTING_REPORT_CONFIG");
}

code = code.replace(
  "const cellEntries = rowEntries.filter(r => classifyByRange(r.jarakKantorKm || 0, matrixRadiusRanges) === rCol.label);",
  "const cellEntries = rowEntries.filter(r => {\n        // Hitung ulang secara dinamis untuk memastikan akurasi data lama\n        const jarakReal = estimateJarakKantor(r.subKantor, JSON.parse(r.rawDataJson || '{}')['K'] || '');\n        return classifyByRange(jarakReal, matrixRadiusRanges) === rCol.label;\n      });"
);

fs.writeFileSync('app/performa/kolektibilitas/page.tsx', code);
console.log('Matrix patched');
