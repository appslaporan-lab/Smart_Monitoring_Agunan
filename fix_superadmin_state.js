const fs = require('fs');
let code = fs.readFileSync('components/SuperadminManageRealisasi.tsx', 'utf8');

code = code.replace("useState('BARU')", "useState('NASABAH_BARU')");

// Also check the logic when saving edit
// Wait, when saving edit in Superadmin, the API is called with nominal = ?
// Ah! In `SuperadminManageRealisasi.tsx`, when sending PUT:
// const nominalNum = editJenis === 'TOP_UP' ? (parseFloat(editNominalAsli) - parseFloat(editSaldoAkhir)) : parseFloat(editNominalAsli);
// This is exactly what we want! Because Nasabah Lama and Nasabah Baru both just use editNominalAsli!

fs.writeFileSync('components/SuperadminManageRealisasi.tsx', code);
