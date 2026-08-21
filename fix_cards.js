const fs = require('fs');

let listCode = fs.readFileSync('app/collecting/CollectingDebiturList.tsx', 'utf8');

listCode = listCode.replace(
  "const cardColors: Record<string, string> = {",
  "const cardColors: Record<string, string> = {\n    JANJI_BAYAR_DEKAT: '#84cc16',"
);

listCode = listCode.replace(
  "const cardLabels: Record<string, string> = {",
  "const cardLabels: Record<string, string> = {\n    JANJI_BAYAR_DEKAT: 'Mendekati Janji Bayar',"
);

listCode = listCode.replace(
  "if (st === 'H7_DESK_CALL') counts.H7_DESK_CALL = (counts.H7_DESK_CALL || 0) + 1;",
  "if (st === 'H7_DESK_CALL') counts.H7_DESK_CALL = (counts.H7_DESK_CALL || 0) + 1;\n      if (st === 'JANJI_BAYAR_DEKAT') counts.JANJI_BAYAR_DEKAT = (counts.JANJI_BAYAR_DEKAT || 0) + 1;"
);

fs.writeFileSync('app/collecting/CollectingDebiturList.tsx', listCode);
console.log('UI patched');
