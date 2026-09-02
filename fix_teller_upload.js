const fs = require('fs');

const path = 'app/api/collecting/upload-teller/route.ts';
let code = fs.readFileSync(path, 'utf8');

const oldRegex = `const norekMatches = rowStr.match(/\\b\\d{10}\\b/g);
      let validNorek = norekMatches ? norekMatches.find(n => activeNoreks.has(n)) : null;`;

const newRegex = `const isKreditRow = rowStr.includes('angsuran') || rowStr.includes('pinjaman') || rowStr.includes('pelunasan') || rowStr.includes('lunas') || rowStr.includes('kredit') || rowStr.includes('pokok') || rowStr.includes('bunga');
      
      const norekMatches = rowStr.match(/\\b\\d{3}[-.\\s]?\\d{3}[-.\\s]?\\d{4}\\b/g);
      const cleanedMatches = norekMatches ? norekMatches.map(n => n.replace(/[-.\\s]/g, '')) : [];
      let validNorek = cleanedMatches.find(n => activeNoreks.has(n)) || null;`;

const oldFallback = `// Fallback: If no Norek found but it's a Pelunasan row, try matching by Name
      if (!validNorek && isLunasRow) {`;

const newFallback = `// Fallback: If no Norek found but it's a Kredit row, try matching by Name
      if (!validNorek && (isLunasRow || isKreditRow)) {`;

if (code.includes(oldRegex) && code.includes(oldFallback)) {
    code = code.replace(oldRegex, newRegex);
    code = code.replace(oldFallback, newFallback);
    fs.writeFileSync(path, code);
    console.log('Fixed teller upload logic');
} else {
    console.log('Could not find teller upload logic');
}
