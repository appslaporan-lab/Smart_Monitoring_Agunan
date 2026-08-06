export type ReportRange = {
  label: string;
  min?: number;
  max?: number;
  keywords?: string[];
};

export type MoParameter = {
  canonicalName: string;
  aliases: string[];
};

export type CollectingReportConfig = {
  nplCodes: string[];
  moParameters: MoParameter[];
  creditProductCategories: ReportRange[];
  interestRateRanges: ReportRange[];
  tenorRanges: ReportRange[];
  arrearsRanges: ReportRange[];
  plafondRanges: ReportRange[];
  collateralCategories: ReportRange[];
};

export const COLLECTING_REPORT_CONFIG: CollectingReportConfig = {
  nplCodes: ['3', '4', '5', '6', 'NPL'],
  moParameters: [
    { canonicalName: 'PUSAT', aliases: ['PUSAT', 'PST'] },
    { canonicalName: 'KAUMAN', aliases: ['KAUMAN', 'KMN'] },
    { canonicalName: 'NGANTRU', aliases: ['NGANTRU', 'NTR'] },
    { canonicalName: 'NGEMPLAK', aliases: ['NGEMPLAK', 'NGLK'] },
    { canonicalName: 'KARANGREJO', aliases: ['KARANGREJO', 'KRJ'] },
    { canonicalName: 'PUCANGLABAN', aliases: ['PUCANGLABAN', 'PCL'] },
    { canonicalName: 'PAKEL', aliases: ['PAKEL', 'PKL'] },
    { canonicalName: 'BOYOLANGU', aliases: ['BOYOLANGU', 'BYL'] },
    { canonicalName: 'REJOTANGAN', aliases: ['REJOTANGAN', 'RJT'] },
    { canonicalName: 'CAMPURDARAT', aliases: ['CAMPURDARAT', 'CPD'] },
    { canonicalName: 'KALIDAWIR', aliases: ['KALIDAWIR', 'KDW'] },
    { canonicalName: 'BANDUNG', aliases: ['BANDUNG', 'BDG'] },
    { canonicalName: 'NGENTRONG', aliases: ['NGENTRONG', 'NTRG'] },
  ],
  creditProductCategories: [
    { label: 'Kredit Produktif', keywords: ['PRODUKTIF', 'KREDIT PRODUKTIF', 'PENGUSAHA', 'UMKM'] },
    { label: 'Kredit Konsumtif', keywords: ['KONSUMTIF', 'KTA', 'KONSUMEN'] },
    { label: 'KPR', keywords: ['KPR', 'RUMAH'] },
    { label: 'Mikro', keywords: ['MIKRO', 'MICRO'] },
    { label: 'Lainnya', keywords: ['LAINNYA', 'LAIN'] },
  ],
  interestRateRanges: [
    { label: '< 10%', min: 0, max: 10 },
    { label: '10% - 13%', min: 10, max: 13 },
    { label: '13% - 16%', min: 13, max: 16 },
    { label: '> 16%', min: 16 },
  ],
  tenorRanges: [
    { label: '<= 12 bulan', min: 0, max: 12 },
    { label: '13 - 24 bulan', min: 13, max: 24 },
    { label: '25 - 36 bulan', min: 25, max: 36 },
    { label: '> 36 bulan', min: 37 },
  ],
  arrearsRanges: [
    { label: '0 - 30 hari', min: 0, max: 30 },
    { label: '31 - 60 hari', min: 31, max: 60 },
    { label: '61 - 90 hari', min: 61, max: 90 },
    { label: '> 90 hari', min: 91 },
  ],
  plafondRanges: [
    { label: '<= 50 juta', min: 0, max: 50000000 },
    { label: '50 - 100 juta', min: 50000001, max: 100000000 },
    { label: '100 - 200 juta', min: 100000001, max: 200000000 },
    { label: '> 200 juta', min: 200000001 },
  ],
  collateralCategories: [
    { label: 'BPKB', keywords: ['BPKB'] },
    { label: 'SHM/AJB', keywords: ['SHM', 'AJB'] },
    { label: 'SK', keywords: ['SK'] },
    { label: 'Emas', keywords: ['EMAS'] },
    { label: 'Deposito', keywords: ['DEPOSITO'] },
    { label: 'Lainnya', keywords: ['LAINNYA', 'LAIN'] },
  ],
};

export function normalizeText(value: string | null | undefined): string {
  return (value || '').toString().trim().toUpperCase();
}

export function normalizeMoName(value: string | null | undefined): string {
  const normalized = normalizeText(value);
  if (!normalized) return 'Tidak diketahui';

  for (const parameter of COLLECTING_REPORT_CONFIG.moParameters) {
    if (parameter.aliases.some((alias) => normalized.includes(alias))) {
      return parameter.canonicalName;
    }
  }

  return normalized;
}

export function classifyByRange(value: number | null | undefined, ranges: ReportRange[]): string {
  if (value === null || value === undefined || Number.isNaN(value)) return 'Tidak diketahui';

  for (const range of ranges) {
    const matchesMin = range.min === undefined || value >= range.min;
    const matchesMax = range.max === undefined || value <= range.max;
    if (matchesMin && matchesMax) return range.label;
  }

  return 'Tidak diketahui';
}

export function classifyByKeywords(value: string | null | undefined, ranges: ReportRange[]): string {
  const normalized = normalizeText(value);
  if (!normalized) return 'Tidak diketahui';

  for (const range of ranges) {
    const keywords = range.keywords || [];
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return range.label;
    }
  }

  return 'Tidak diketahui';
}
