import * as XLSX from 'xlsx';

const KATEGORI_DIIZINKAN = ['UK', 'UM', 'UT'];

export type UploadJenis = 'COLLECTING' | 'PERFORM_KOLEKTIBILITAS';

const normalizeUploadType = (value: string | null | undefined): UploadJenis => {
  return value === 'PERFORM_KOLEKTIBILITAS' ? 'PERFORM_KOLEKTIBILITAS' : 'COLLECTING';
};

const getCellValue = (row: any, candidates: string[]): any => {
  for (const key of candidates) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== '') return row[key];
  }
  return null;
};

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
  jenisJaminan: string | null;
  plafon: number | null;
  outstanding: number | null;
  tunggakanPokok: number | null;
  tunggakanBunga: number | null;
  angsuranPerBulan: number | null;
  tglRealisasi: Date | null;
  tglJatuhTempo: Date | null;
  jangkaBulan: number | null;
  kdKolektibilitas: string | null;
  produkKredit: string | null;
  hariTunggakan: number;
  rawDataJson: string;
};

export function parseNominatifExcel(buffer: Buffer, uploadType: string = 'COLLECTING'): { rows: ParsedRow[]; totalBarisAsli: number; totalDilewati: number } {
  const normalizedType = normalizeUploadType(uploadType);
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: false });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const allRows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: null });

  const rows: ParsedRow[] = [];
  let totalDilewati = 0;

  for (const row of allRows) {
    const kategori = String(getCellValue(row, ['KATEGORI DEBITUR', 'KATEGORI', 'CATEGORY']) || '')
      .trim()
      .toUpperCase();
    if (!KATEGORI_DIIZINKAN.includes(kategori)) {
      totalDilewati++;
      continue;
    }

    const norek = String(getCellValue(row, ['NOREK', 'NO REKENING', 'NO REK']) || '').trim();
    if (!norek) {
      totalDilewati++;
      continue;
    }

    rows.push({
      norek,
      namaNasabahExcel: String(getCellValue(row, ['NAMA', 'NAMA NASABAH', 'CUSTOMER NAME']) || '').trim(),
      alamatExcel: getCellValue(row, ['ALAMAT', 'ADDRESS']) ? String(getCellValue(row, ['ALAMAT', 'ADDRESS'])).trim() : null,
      noIdentitas: getCellValue(row, ['NO IDENTITAS', 'NO KTP', 'NIK']) ? String(getCellValue(row, ['NO IDENTITAS', 'NO KTP', 'NIK'])).trim() : null,
      noTelepon: getCellValue(row, ['NO TELEPON', 'TELEPON', 'PHONE']) ? String(getCellValue(row, ['NO TELEPON', 'TELEPON', 'PHONE'])).trim() : null,
      subKantor: getCellValue(row, ['SUB KANTOR', 'KANTOR', 'CABANG']) ? String(getCellValue(row, ['SUB KANTOR', 'KANTOR', 'CABANG'])).trim() : null,
      namaAO: getCellValue(row, ['NAMA AO', 'AO', 'NAMA MO']) ? String(getCellValue(row, ['NAMA AO', 'AO', 'NAMA MO'])).trim() : null,
      kategoriDebitur: kategori,
      namaKategoriDebitur: getCellValue(row, ['NAMA KATEGORI DEBITUR', 'KATEGORI DEBITUR NAME']) ? String(getCellValue(row, ['NAMA KATEGORI DEBITUR', 'KATEGORI DEBITUR NAME'])).trim() : null,
      plafon: toNumber(getCellValue(row, ['NILAI FAS ASAL', 'PLAFON', 'PLAFOND'])),
      outstanding: toNumber(getCellValue(row, ['SLD PINJAMAN PKK', 'OUTSTANDING', 'SISA PINJAMAN'])),
      tunggakanPokok: toNumber(getCellValue(row, ['SLD TUNGGAK PKK', 'TUNGGAKAN POKOK'])),
      tunggakanBunga: toNumber(getCellValue(row, ['SLD TUNGGAK BGA', 'TUNGGAKAN BUNGA'])),
      angsuranPerBulan: toNumber(getCellValue(row, ['NILAI TGH ANGSURAN', 'ANGSURAN', 'ANGSURAN PER BULAN'])),
      tglRealisasi: toDate(getCellValue(row, ['TGL REALISASI', 'TGL REALISASI PINJAMAN'])),
      tglJatuhTempo: toDate(getCellValue(row, ['TGL JTH TMP', 'TGL JATUH TEMPO'])),
      jangkaBulan: toNumber(getCellValue(row, ['JANGKA BLN', 'TENOR', 'JANGKA'])),
      kdKolektibilitas: getCellValue(row, normalizedType === 'PERFORM_KOLEKTIBILITAS' ? ['KD KOL EFF', 'KOLEKTIBILITAS', 'KODE KOLEKTIBILITAS', 'KODE KOLEKTIBILITAS EFF'] : ['KD KOL EFF', 'KOLEKTIBILITAS', 'KODE KOLEKTIBILITAS']) ? String(getCellValue(row, normalizedType === 'PERFORM_KOLEKTIBILITAS' ? ['KD KOL EFF', 'KOLEKTIBILITAS', 'KODE KOLEKTIBILITAS', 'KODE KOLEKTIBILITAS EFF'] : ['KD KOL EFF', 'KOLEKTIBILITAS', 'KODE KOLEKTIBILITAS'])).trim() : null,
      jenisJaminan: getCellValue(row, ['JENIS JAMINAN', 'JENIS_JAMINAN', 'JENIS JAMINAN ASLI', 'JENIS_JAMINAN_ASLI']) ? String(getCellValue(row, ['JENIS JAMINAN', 'JENIS_JAMINAN', 'JENIS JAMINAN ASLI', 'JENIS_JAMINAN_ASLI'])).trim() : null,
      produkKredit: getCellValue(row, ['PRODUK KREDIT', 'PRODUK', 'JENIS PRODUK', 'PRODUCT', 'PRODUCT TYPE']) ? String(getCellValue(row, ['PRODUK KREDIT', 'PRODUK', 'JENIS PRODUK', 'PRODUCT', 'PRODUCT TYPE'])).trim() : null,
      hariTunggakan: toNumber(getCellValue(row, ['JML HR TUNGGAKAN EFF', 'HARI TUNGGAKAN', 'HARI'])) || 0,
      rawDataJson: JSON.stringify(row),
    });
  }

  return { rows, totalBarisAsli: allRows.length, totalDilewati };
}