import * as XLSX from 'xlsx';

const KATEGORI_DIIZINKAN = ['UK', 'UM', 'UT'];

const toNumber = (val: any): number | null => {
  if (val === null || val === undefined || val === '') return null;
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/,/g, ''));
  return isNaN(num) ? null : num;
};

const toDate = (val: any): Date | null => {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (typeof val === 'number') {
    const parsed = XLSX.SSF.parse_date_code(val);
    if (!parsed) return null;
    return new Date(parsed.y, parsed.m - 1, parsed.d);
  }
  const parsed = new Date(val);
  return isNaN(parsed.getTime()) ? null : parsed;
};

export type ParsedRow = {
  norek: string;
  namaNasabahExcel: string;
  alamatExcel: string | null;
  noIdentitas: string | null;
  noTelepon: string | null;
  subKantor: string | null;
  namaAO: string | null;
  kategoriDebitur: string | null;
  namaKategoriDebitur: string | null;
  plafon: number | null;
  outstanding: number | null;
  tunggakanPokok: number | null;
  tunggakanBunga: number | null;
  angsuranPerBulan: number | null;
  tglRealisasi: Date | null;
  tglJatuhTempo: Date | null;
  jangkaBulan: number | null;
  kdKolektibilitas: string | null;
  hariTunggakan: number;
  rawDataJson: string;
};

export function parseNominatifExcel(buffer: Buffer): { rows: ParsedRow[]; totalBarisAsli: number; totalDilewati: number } {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: false });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const allRows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: null });

  const rows: ParsedRow[] = [];
  let totalDilewati = 0;

  for (const row of allRows) {
    const kategori = (row['KATEGORI DEBITUR'] || '').toString().trim().toUpperCase();
    if (!KATEGORI_DIIZINKAN.includes(kategori)) {
      totalDilewati++;
      continue;
    }

    const norek = (row['NOREK'] || '').toString().trim();
    if (!norek) {
      totalDilewati++;
      continue;
    }

    rows.push({
      norek,
      namaNasabahExcel: (row['NAMA'] || '').toString().trim(),
      alamatExcel: row['ALAMAT'] ? String(row['ALAMAT']).trim() : null,
      noIdentitas: row['NO IDENTITAS'] ? String(row['NO IDENTITAS']).trim() : null,
      noTelepon: row['NO TELEPON'] ? String(row['NO TELEPON']).trim() : null,
      subKantor: row['SUB KANTOR'] ? String(row['SUB KANTOR']).trim() : null,
      namaAO: row['NAMA AO'] ? String(row['NAMA AO']).trim() : null,
      kategoriDebitur: kategori,
      namaKategoriDebitur: row['NAMA KATEGORI DEBITUR'] ? String(row['NAMA KATEGORI DEBITUR']).trim() : null,
      plafon: toNumber(row['NILAI FAS ASAL']),
      outstanding: toNumber(row['SLD PINJAMAN PKK']),
      tunggakanPokok: toNumber(row['SLD TUNGGAK PKK']),
      tunggakanBunga: toNumber(row['SLD TUNGGAK BGA']),
      angsuranPerBulan: toNumber(row['NILAI TGH ANGSURAN']),
      tglRealisasi: toDate(row['TGL REALISASI']),
      tglJatuhTempo: toDate(row['TGL JTH TMP']),
      jangkaBulan: toNumber(row['JANGKA BLN']),
      kdKolektibilitas: row['KD KOL EFF'] ? String(row['KD KOL EFF']).trim() : null,
      hariTunggakan: toNumber(row['JML HR TUNGGAKAN EFF']) || 0,
      rawDataJson: JSON.stringify(row),
    });
  }

  return { rows, totalBarisAsli: allRows.length, totalDilewati };
}