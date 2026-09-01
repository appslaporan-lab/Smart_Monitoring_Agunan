const fs = require('fs');
let code = fs.readFileSync('lib/kantor.ts', 'utf8');

const oldNormalize = `const normalizeSubKantor = (subKantor: string | null | undefined) => {
  if (!subKantor) return null;
  return subKantor.trim().padStart(2, '0');
};`;

const newNormalize = `const normalizeSubKantor = (subKantor: string | null | undefined) => {
  if (!subKantor) return null;
  const str = subKantor.trim().toUpperCase();
  const tokens = str.match(/\\b\\d{2}\\b/g);
  if (tokens) {
    return tokens[tokens.length - 1];
  }
  return str.padStart(2, '0');
};`;

if (code.includes(oldNormalize)) {
  code = code.replace(oldNormalize, newNormalize);
  fs.writeFileSync('lib/kantor.ts', code);
  console.log('Fixed normalizeSubKantor');
} else {
  console.log('normalizeSubKantor not found');
}
