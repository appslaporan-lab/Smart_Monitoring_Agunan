const fs = require('fs');
let code = fs.readFileSync('app/collecting/page.tsx', 'utf8');

const oldReturn = `kolBulanIni: p.kdKolektibilitas,
      kolBulanLalu: p.kdKolektibilitasLalu || null,
    };
  }).sort(`;
// Wait, the previous search showed:
// kolBulanIni: p.kdKolektibilitas,
// kolBulanLalu: prevKolMap.get(p.norek) || null,

const searchStr = `kolBulanLalu: prevKolMap.get(p.norek) || null,`;
const replaceStr = `kolBulanLalu: prevKolMap.get(p.norek) || null,\n      sudahBayar: p.sudahBayar,\n      nominalBayarHariIni: p.nominalBayarHariIni,`;

if (!code.includes('sudahBayar: p.sudahBayar')) {
  // Wait, let's see if kolBulanLalu is actually prevKolMap or p.kdKolektibilitasLalu
  // In the previous step I added kdKolektibilitasLalu to schema, but did I update page.tsx?
  // Let me just replace `kolBulanLalu: p.kdKolektibilitasLalu || null,` OR `prevKolMap`
  code = code.replace(/kolBulanIni: p.kdKolektibilitas,[\s\S]*?\};/, (match) => {
    return match.replace("};", "sudahBayar: p.sudahBayar,\n      nominalBayarHariIni: p.nominalBayarHariIni,\n    };");
  });
  fs.writeFileSync('app/collecting/page.tsx', code);
}
console.log('page.tsx mapped');
