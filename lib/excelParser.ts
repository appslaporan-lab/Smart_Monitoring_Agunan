import * as XLSX from 'xlsx';

export type UploadJenis = 'COLLECTING' | 'PERFORM_KOLEKTIBILITAS';

const normalizeUploadType = (value: string | null | undefined): UploadJenis => {
  return value === 'PERFORM_KOLEKTIBILITAS' ? 'PERFORM_KOLEKTIBILITAS' : 'COLLECTING';
};

const getCellValue = (row: any, candidates: string[]): any => {
  const normalizedRow: any = {};
  for (const k in row) {
    normalizedRow[k.trim().toUpperCase()] = row[k];
  }
  const normalizedCandidates = candidates.map(c => c.trim().toUpperCase());
  for (const key of normalizedCandidates) {
    if (normalizedRow[key] !== undefined && normalizedRow[key] !== null && normalizedRow[key] !== '') return normalizedRow[key];
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
  if (typeof val === 'string') {
    const match = val.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (match) {
      return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
    }
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
  sukuBunga?: number | null;
  tglRealisasi: Date | null;
  tglJatuhTempo: Date | null;
  jangkaBulan: number | null;
  kdKolektibilitas: string | null;
  kdKolektibilitasLalu: string | null;
  produkKredit: string | null;
  sektorEkonomi?: string | null;
  jarakKantorKm?: number | null;
  hariTunggakan: number;
  rawDataJson: string;
};

import { mapProdukKredit, mapSektorEkonomi, mapJenisJaminan, estimateJarakKantor } from './mappingUtils';

export function parseNominatifExcel(buffer: Buffer, uploadType: string = 'COLLECTING', aoList: { rawName: string; mappedName: string }[] = []): { rows: ParsedRow[]; totalBarisAsli: number; totalDilewati: number } {
  const normalizedType = normalizeUploadType(uploadType);
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: false });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  // Gunakan header: "A" agar key dari JSON adalah huruf kolom (A, B, C, dst)
  const allRows: any[] = XLSX.utils.sheet_to_json(sheet, { header: "A", defval: null });

  const rows: ParsedRow[] = [];
  let totalDilewati = 0;

  for (const row of allRows) {
    const isRowEmpty = Object.values(row).every(v => v === null || v === undefined || v === '' || (typeof v === 'string' && v.trim() === ''));
    if (isRowEmpty) {
      continue;
    }

    const norekStr = String(row['A'] || '').trim();
    
    // Skip baris header (jika kolom A berisi teks header seperti 'NO REKENING', 'NOREK', dll)
    const norekUpper = norekStr.toUpperCase();
    if (norekUpper.includes('REK') || norekUpper === 'NO' || norekUpper.includes('NOMOR') || norekUpper === 'A') {
      continue;
    }

    if (!norekStr) {
      totalDilewati++;
      continue;
    }

    const kategori = String(row['C'] || '').trim().toUpperCase();
    const kdProduct = String(row['C'] || '').trim();
    const rawJaminan = String(row['BT'] || '').trim();
    const kecamatanNasabah = String(row['K'] || '').trim();

    // Gabungkan E (Kantor) dan F (Sub Kantor)
    const kantor = String(row['E'] || '').trim();
    const sub = String(row['F'] || '').trim();
    const subKantorGabungan = [kantor, sub].filter(Boolean).join(' - ') || null;

    let rawAo = String(row['AQ'] || '').trim();
    if (!rawAo) rawAo = subKantorGabungan || 'KANTOR TIDAK DIKETAHUI';
    
    const matchedAo = aoList.find(a => a.rawName === rawAo);
    const finalAo = matchedAo ? matchedAo.mappedName : rawAo;

    rows.push({
      norek: norekStr,
      namaNasabahExcel: String(row['G'] || '').trim(),
      alamatExcel: row['H'] ? String(row['H']).trim() : null,
      noIdentitas: null, // Sesuai pemetaan (?)
      noTelepon: row['AT'] ? String(row['AT']).trim() : null,
      subKantor: subKantorGabungan,
      namaAO: finalAo,
      kategoriDebitur: kategori,
      namaKategoriDebitur: row['D'] ? String(row['D']).trim() : null,
      plafon: toNumber(row['S']),
      outstanding: toNumber(row['R']),
      tunggakanPokok: toNumber(row['Z']),
      tunggakanBunga: toNumber(row['X']), // Sesuai pemetaan dari kolom X
      angsuranPerBulan: toNumber(row['AA']),
      sukuBunga: toNumber(row['T']),
      tglRealisasi: toDate(row['AC']),
      tglJatuhTempo: toDate(row['AD']),
      jangkaBulan: toNumber(row['AE']),
      kdKolektibilitas: row['P'] ? String(row['P']).trim() : null,
      kdKolektibilitasLalu: row['Q'] ? String(row['Q']).trim() : null,
      jenisJaminan: mapJenisJaminan(rawJaminan),
      produkKredit: mapProdukKredit(kdProduct),
      sektorEkonomi: mapSektorEkonomi(kdProduct),
      jarakKantorKm: estimateJarakKantor(subKantorGabungan || kantor, kecamatanNasabah),
      hariTunggakan: toNumber(row['BB']) || 0,
      rawDataJson: JSON.stringify(row),
    });
  }

  return { rows, totalBarisAsli: allRows.length, totalDilewati };
}