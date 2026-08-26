const fs = require('fs');
let code = fs.readFileSync('lib/kantor.ts', 'utf8');

const mappingCode = `
export const SUB_KANTOR_NAMES: Record<string, string> = {
  '01': 'Kas Pusat',
  '02': 'Kas Campurdarat',
  '03': 'Kas Ngunut',
  '04': 'Kas Bandung',
  '05': 'Kas Kalidawir',
  '06': 'Kas Kauman',
  '07': 'Kas Ngantru',
  '08': 'Kas Boyolangu',
  '09': 'Kas Rejotangan',
  '10': 'Kas Ngemplak',
  '12': 'Kas Pucanglaban',
  '13': 'Kas Pakel',
  '14': 'Kas Karangrejo',
  '15': 'Kas Ngentrong',
};

export function getSubKantorName(subKantor: string | null | undefined): string {
  if (!subKantor) return '-';
  const tokens = subKantor.match(/\\b\\d{2}\\b/g);
  if (tokens) {
    const lastCode = tokens[tokens.length - 1];
    if (SUB_KANTOR_NAMES[lastCode]) {
      return SUB_KANTOR_NAMES[lastCode];
    }
  }
  return subKantor;
}
`;

code = code.replace("export function getKantorGroup(", mappingCode + "\nexport function getKantorGroup(");
fs.writeFileSync('lib/kantor.ts', code);
console.log('Added sub kantor mapping');
