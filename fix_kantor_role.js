const fs = require('fs');
let code = fs.readFileSync('lib/kantor.ts', 'utf8');

const oldLogic = `if (normalizedRole === 'TELLER' || normalizedRole === 'MO') {
    const normalizedUserSub = normalizeSubKantor(userSubKantor);
    const normalizedItemSub = normalizeSubKantor(itemSubKantor);
    if (!normalizedUserSub || !normalizedItemSub) return false;
    return normalizedUserSub === normalizedItemSub;
  }`;

const newLogic = `if (normalizedRole === 'TELLER' || normalizedRole === 'MO' || normalizedRole === 'KEPALA_KAS' || (normalizedRole && normalizedRole.includes('KASUBAG'))) {
    const normalizedUserSub = normalizeSubKantor(userSubKantor);
    if (normalizedUserSub) {
      const normalizedItemSub = normalizeSubKantor(itemSubKantor);
      if (!normalizedItemSub) return false;
      return normalizedUserSub === normalizedItemSub;
    }
    // Jika role KASUBAG tidak memiliki subKantor spesifik, biarkan jatuh ke logika grup di bawah (misal untuk CABANG)
    if (normalizedRole === 'KEPALA_KAS') return false; 
  }`;

if (code.includes(oldLogic)) {
  code = code.replace(oldLogic, newLogic);
  fs.writeFileSync('lib/kantor.ts', code);
  console.log('Fixed canAccessKantorData logic for KEPALA_KAS and KASUBAG');
} else {
  console.log('Logic not found in lib/kantor.ts');
}
