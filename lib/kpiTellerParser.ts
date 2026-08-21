import * as xlsx from 'xlsx';

export type TellerBucket = { count: number; total: number; errors: number };

export type TellerKPIResult = {
  setoran: TellerBucket;
  penarikan: TellerBucket;
  angsuran: TellerBucket;
  pencairanPinjaman: TellerBucket;
  pencairanDeposito: TellerBucket;
  errorCount: number;
  foundUsers: string[];
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

  let setoran: TellerBucket = { count: 0, total: 0, errors: 0 };
  let penarikan: TellerBucket = { count: 0, total: 0, errors: 0 };
  let angsuran: TellerBucket = { count: 0, total: 0, errors: 0 };
  let pencairanPinjaman: TellerBucket = { count: 0, total: 0, errors: 0 };
  let pencairanDeposito: TellerBucket = { count: 0, total: 0, errors: 0 };
  
  let errorCount = 0;
  const foundUsersSet = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row[ketIdx]) continue;

    const ket = String(row[ketIdx]).trim().toUpperCase();
    const nilaiDb = parseNumber(row[dbIdx]);
    const nilaiCr = parseNumber(row[crIdx]);
    const rowUser = String(row[userIdx] || '').toUpperCase().trim();

    if (rowUser && rowUser !== 'USER' && rowUser !== 'KANTOR') {
      foundUsersSet.add(rowUser);
    }

    // Check if belongs to current user
    const normalizedCurrentUser = currentUserName.toUpperCase().trim();
    if (!rowUser.includes(normalizedCurrentUser) && !normalizedCurrentUser.includes(rowUser)) {
      continue;
    }

    const isError = (nilaiDb < 0 || nilaiCr < 0);
    if (isError) errorCount++;

    if (ket.startsWith('SETORAN')) {
      setoran.count++; setoran.total += nilaiCr;
      if (isError) setoran.errors++;
    } else if (ket.startsWith('TARIKAN')) {
      penarikan.count++; penarikan.total += nilaiDb;
      if (isError) penarikan.errors++;
    } else if (ket.includes('DEPOSITO') && (ket.startsWith('PENCAIRAN') || ket.startsWith('TARIKAN'))) {
      pencairanDeposito.count++; pencairanDeposito.total += (nilaiDb > 0 ? nilaiDb : nilaiCr);
      if (isError) pencairanDeposito.errors++;
    } else if (ket.startsWith('PENCAIRAN')) {
      pencairanPinjaman.count++; pencairanPinjaman.total += nilaiCr;
      if (isError) pencairanPinjaman.errors++;
    } else if (ket.startsWith('BAYAR') || ket.startsWith('PELUNASAN') || ket.startsWith('BIAYA PROVISI') || ket.startsWith('BIAYA ADMIN')) {
      angsuran.count++; angsuran.total += nilaiDb;
      if (isError) angsuran.errors++;
    }
  }

  return {
    setoran,
    penarikan,
    angsuran,
    pencairanPinjaman,
    pencairanDeposito,
    errorCount,
    foundUsers: Array.from(foundUsersSet)
  };
}
