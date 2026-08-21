import * as xlsx from 'xlsx';

export type TellerKPIResult = {
  setoran: { count: number; total: number };
  penarikan: { count: number; total: number };
  angsuran: { count: number; total: number };
  pencairan: { count: number; total: number };
  errorCount: number;
};

function parseNumber(val: any): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const str = String(val).replace(/,/g, '').trim();
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

export function parseTellerExcel(buffer: Buffer, currentUserName: string): TellerKPIResult {
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  
  // Read as 2D array
  const rows = xlsx.utils.sheet_to_json<any[]>(sheet, { header: 1 });

  let ketIdx = -1;
  let dbIdx = -1;
  let crIdx = -1;
  let userIdx = -1;

  // Find header row
  for (let i = 0; i < Math.min(20, rows.length); i++) {
    const row = rows[i];
    if (!row) continue;
    for (let j = 0; j < row.length; j++) {
      const cell = String(row[j] || '').toUpperCase().trim();
      if (cell === 'KETERANGAN') ketIdx = j;
      if (cell === 'NILAI DB' || cell === 'DEBET' || cell === 'DB') dbIdx = j;
      if (cell === 'NILAI CR' || cell === 'KREDIT' || cell === 'CR') crIdx = j;
      if (cell === 'USER') userIdx = j;
    }
    if (ketIdx !== -1 && dbIdx !== -1 && crIdx !== -1) {
      break;
    }
  }

  // Fallback if headers not exactly matched
  if (ketIdx === -1) ketIdx = 5; 
  if (dbIdx === -1) dbIdx = 6;
  if (crIdx === -1) crIdx = 7;
  if (userIdx === -1) userIdx = 8; // In the OCR, USER is right after CR

  let setoranCount = 0; let setoranTotal = 0;
  let penarikanCount = 0; let penarikanTotal = 0;
  let angsuranCount = 0; let angsuranTotal = 0;
  let pencairanCount = 0; let pencairanTotal = 0;
  let errorCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row[ketIdx]) continue;

    const ket = String(row[ketIdx]).trim().toUpperCase();
    const nilaiDb = parseNumber(row[dbIdx]);
    const nilaiCr = parseNumber(row[crIdx]);
    const rowUser = String(row[userIdx] || '').toUpperCase().trim();

    // Check errors (only count if it belongs to the logged in user)
    // Sometimes user names might be abbreviated, so we do a simple substring match
    const normalizedCurrentUser = currentUserName.toUpperCase().trim();
    if (rowUser.includes(normalizedCurrentUser) || normalizedCurrentUser.includes(rowUser)) {
      if (nilaiDb < 0 || nilaiCr < 0) {
        errorCount++;
      }
    }

    if (ket.startsWith('SETORAN')) {
      setoranCount++; setoranTotal += nilaiCr;
    } else if (ket.startsWith('TARIKAN')) {
      penarikanCount++; penarikanTotal += nilaiDb;
    } else if (ket.startsWith('PENCAIRAN')) {
      pencairanCount++; pencairanTotal += nilaiCr;
    } else if (ket.startsWith('BAYAR') || ket.startsWith('PELUNASAN') || ket.startsWith('BIAYA PROVISI') || ket.startsWith('BIAYA ADMIN')) {
      angsuranCount++; angsuranTotal += nilaiDb;
    }
  }

  return {
    setoran: { count: setoranCount, total: setoranTotal },
    penarikan: { count: penarikanCount, total: penarikanTotal },
    angsuran: { count: angsuranCount, total: angsuranTotal },
    pencairan: { count: pencairanCount, total: pencairanTotal },
    errorCount
  };
}
