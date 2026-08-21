const fs = require('fs');
let code = fs.readFileSync('app/performa/kolektibilitas/page.tsx', 'utf8');

const replacement = `
  const SUBKANTOR_NAME_MAP: Record<string, string> = {
    '01': 'PUSAT',
    '06': 'KAUMAN',
    '07': 'NGANTRU',
    '10': 'NGEMPLAK',
    '14': 'KARANGREJO',
    '03': 'NGUNUT',
    '05': 'KALIDAWIR',
    '09': 'REJOTANGAN',
    '12': 'PUCANGLABAN',
    '02': 'CAMPURDARAT',
    '04': 'BANDUNG',
    '08': 'BOYOLANGU',
    '13': 'PAKEL',
    '15': 'NGENTRONG'
  };

  const reportRows = rows.map((row) => {
    let subKantorCode = row.subKantor || '';
    if (subKantorCode.includes('-')) {
      subKantorCode = subKantorCode.split('-').pop()?.trim() || subKantorCode;
    } else {
      subKantorCode = subKantorCode.trim();
    }
    
    // Fallback if not numeric code, try to match by string, otherwise use the code
    let subKantorClean = SUBKANTOR_NAME_MAP[subKantorCode] || subKantorCode.toUpperCase();
    
    let kGroup = getKantorGroup(row.subKantor) || '';
    // Fix PUSAT_1 to PUSAT 1
    if (kGroup === 'PUSAT_1') kGroup = 'PUSAT 1';
    if (kGroup === 'PUSAT_2') kGroup = 'PUSAT 2';

    const kolStr = String(row.kdKolektibilitas || '').trim();
    return {
      subKantor: subKantorClean,
      kantorGroup: kGroup,
`;

code = code.replace(/const reportRows = rows\.map\(\(row\) => \{[\s\S]*?return \{[\s\S]*?kantorGroup: getKantorGroup\(row\.subKantor\),/m, replacement);
fs.writeFileSync('app/performa/kolektibilitas/page.tsx', code);
console.log('Fixed kantor mapping');
