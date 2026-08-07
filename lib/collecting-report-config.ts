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
    { canonicalName: 'AFIF', aliases: ['AFIFUDIN'] },
    { canonicalName: 'ALEX', aliases: ['ALEX', 'ALX'] },
    { canonicalName: 'ARI', aliases: ['ARI'] },
    { canonicalName: 'ARISW', aliases: ['ARISW', 'ASW'] },
    { canonicalName: 'ARISY', aliases: ['ARISY', 'ASY'] },
    { canonicalName: 'BANDUNG', aliases: ['BANDUNG', 'FARIZ'] },
    { canonicalName: 'BEKTI', aliases: ['BEKTI', 'BTN'] },
    { canonicalName: 'BENO', aliases: ['BENO', 'BEN'] },
    { canonicalName: 'BOYOLANGU', aliases: ['BOYOLANGU', 'BYL'] },
    { canonicalName: 'CAMPURDARAT', aliases: ['CAMPURDARAT', 'CMD'] },
    { canonicalName: 'CHINTIA', aliases: ['CHINTIA', 'CHN'] },
    { canonicalName: 'DANDANG', aliases: ['DANDANG', 'DDG'] },
    { canonicalName: 'DWIK', aliases: ['DWIK', 'DWI', 'DWK'] },
    { canonicalName: 'EDY', aliases: ['EDY'] },
    { canonicalName: 'ENDANG', aliases: ['ENDANG', 'END'] },
    { canonicalName: 'ERINCA', aliases: ['ERINCA'] },
    { canonicalName: 'ERWINDA', aliases: ['ERWINDA'] },
    { canonicalName: 'FATIMAH', aliases: ['FATIMAH', 'FTM'] },
    { canonicalName: 'FELICIA', aliases: ['FELICIA', 'FLC'] },
    { canonicalName: 'FRAGA', aliases: ['FRAGA', 'FRA'] },
    { canonicalName: 'KALIDAWIR', aliases: ['KALIDAWIR', 'KLD'] },
    { canonicalName: 'KARANGREJO', aliases: ['KARANGREJO', 'KRJ'] },
    { canonicalName: 'KAUMAN', aliases: ['KAUMAN', 'KUM'] },
    { canonicalName: 'KAUTSAR', aliases: ['KAUTSAR', 'KSR'] },
    { canonicalName: 'KENAN', aliases: ['KENAN', 'KEN'] },
    { canonicalName: 'LENDRI', aliases: ['LENDRI', 'LEN'] },
    { canonicalName: 'MASDUKI', aliases: ['MASDUKI', 'MAS'] },
    { canonicalName: 'MICHAEL', aliases: ['MICHAEL', 'MCL'] },
    { canonicalName: 'MEIHANA', aliases: ['MEIHANA'] },
    { canonicalName: 'NANANG', aliases: ['NANANG', 'NNG'] },
    { canonicalName: 'NGANTRU', aliases: ['NGANTRU', 'NTR'] },
    { canonicalName: 'NGEMPLAK', aliases: ['NGEMPLAK', 'PSR'] },
    { canonicalName: 'NGENTRONG', aliases: ['NGENTRONG', 'TAUFIK'] },
    { canonicalName: 'NGUNUT', aliases: ['NGUNUT'] },
    { canonicalName: 'NOVAN', aliases: ['NOVAN'] },
    { canonicalName: 'PAKEL', aliases: ['PAKEL', 'PKL', 'HAN'] },
    { canonicalName: 'PUCANGLABAN', aliases: ['PUCANGLABAN'] },
    { canonicalName: 'PUSAT', aliases: ['PUSAT', 'PST'] },
    { canonicalName: 'RANI', aliases: ['RANI', 'RAN'] },
    { canonicalName: 'REJOTANGAN', aliases: ['REJOTANGAN', 'RJT'] },
    { canonicalName: 'RIRIN', aliases: ['RIRIN', 'RIN'] },
    { canonicalName: 'SUNARI', aliases: ['SUNARI', 'SNR'] },
    { canonicalName: 'TEDI', aliases: ['TEDI', 'TDI'] },
    { canonicalName: 'VANY', aliases: ['VANY', 'VNY'] },
    { canonicalName: 'YUDHA', aliases: ['YUDHA', 'YDA'] },
  ],
  creditProductCategories: [
    { label: 'KREDIT REGULER', keywords: ['KREDIT REGULER', 'REGULER', 'KREDIT DAGANG REGULER', 'KREDIT INDUSTRI REGULER', 'KREDIT JASA REGULER', 'KREDIT PERTANIAN REGULER'] },
    { label: 'KREDIT UKM EFEKTIF', keywords: ['KREDIT UKM EFEKTIF', 'UKM EFEKTIF', 'EIR', 'EFEKTIF'] },
    { label: 'KREDIT UKM', keywords: ['KREDIT UKM', 'UKM', 'KREDIT DAGANG UKM', 'KREDIT INDUSTRI UKM', 'KREDIT JASA UKM', 'KREDIT PERTANIAN UKM', 'DEBITUR UMKM MIKRO', 'DEBITUR UMKM MENENGAH', 'DEBITUR UMKM KECIL'] },
    { label: 'KREDIT PEGAWAI', keywords: ['KREDIT PEGAWAI', 'PEGAWAI', 'ANUITAS', 'PEGAWAI ANUITAS'] },
    { label: 'KREDIT PERANGKAT', keywords: ['KREDIT PERANGKAT', 'PERANGKAT', 'KEPALA DESA', 'KREDIT KEPALA DESA', 'PERANGKAT DESA'] },
    { label: 'KREDIT SINDIKASI', keywords: ['KREDIT SINDIKASI', 'SINDIKASI'] },
    { label: 'KREDIT HARAMAIN', keywords: ['KREDIT HARAMAIN', 'HARAMAIN'] },
    { label: 'KREDIT PENGHASILAN TETAP', keywords: ['KREDIT PENGHASILAN TETAP', 'PENGHASILAN TETAP', 'KPT'] },
    { label: 'KREDIT TUNAS', keywords: ['KREDIT TUNAS', 'TUNAS'] },
    { label: 'KREDIT PPPK PARUH WAKTU', keywords: ['KREDIT PPPK PARUH WAKTU', 'PPPK PARUH WAKTU', 'PPPK'] },
    { label: 'KREDIT SENYUM', keywords: ['KREDIT SENYUM', 'SENYUM'] },
    { label: 'LAINNYA', keywords: ['LAINNYA', 'LAIN'] },
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
    { label: 'SHM/AJB', keywords: ['SHM', 'AJB', 'SHGB', 'SHM NIB'] },
    { label: 'SK', keywords: ['SK'] },
    { label: 'Emas', keywords: ['EMAS'] },
    { label: 'Deposito', keywords: ['DEPOSITO', 'DEPOSITO AN', 'BILYET DEPOSITO'] },
    { label: 'Lainnya', keywords: ['LAINNYA', 'LAIN', 'TIDAK TERKLASIFIKASI', 'PROSES SERTIFIKASI', 'NO BIYET', 'NOMOR REGISTER', 'NOMOR REGISTER JAMINAN', 'NO REGISTER JAMINAN'] },
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
