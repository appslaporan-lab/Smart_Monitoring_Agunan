const fs = require('fs');
let code = fs.readFileSync('app/performa/kolektibilitas/page.tsx', 'utf8');

if (!code.includes('const allAOs = await prisma.masterAo.findMany')) {
  // Add fetching MasterAO
  code = code.replace(
    "const rows = await prisma.pinjamanPeriode.findMany({",
    "const allAOs = await prisma.masterAo.findMany();\n  const aoMap = new Map(allAOs.map(a => [a.rawName, a.mappedName]));\n\n  const rows = await prisma.pinjamanPeriode.findMany({"
  );
  
  // Update reportRows mapping for moName
  code = code.replace(
    "moName: row.namaAO || '(blank)',",
    "moName: (() => {\n        let raw = '';\n        if (row.rawDataJson) {\n          const parsed = JSON.parse(row.rawDataJson);\n          raw = String(parsed['AQ'] || '').trim();\n          if (!raw) {\n            const kantor = String(parsed['E'] || '').trim();\n            const sub = String(parsed['F'] || '').trim();\n            const subKantorGabungan = [kantor, sub].filter(Boolean).join(' - ') || null;\n            raw = subKantorGabungan || 'KANTOR TIDAK DIKETAHUI';\n          }\n        } else {\n          raw = row.namaAO || '(blank)';\n        }\n        return aoMap.get(raw) || raw;\n      })(),"
  );
}

fs.writeFileSync('app/performa/kolektibilitas/page.tsx', code);
console.log('AO patched accurately');
