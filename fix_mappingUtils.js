const fs = require('fs');
let code = fs.readFileSync('lib/mappingUtils.ts', 'utf8');

const replacement = `
const DISTANCE_TO_TULUNGAGUNG: Record<string, number> = {
  // > 100 KM
  'RUNGKUT': 150, 'JEMBER': 250, 'BUDURAN': 140, 'PULO GADUNG': 800, 'JIWAN': 120, 'SEMANDING': 180, 'GEDANGAN': 140,
  
  // 51 - 100 KM
  'BLIMBING': 80, 'SINGOSARI': 80, 'LOWOKWARU': 80, 'NGANJUK': 60, 'GUDO': 90,
  
  // 31 - 50 KM (Kediri, Blitar, Trenggalek)
  'GURAH': 40, 'SUTOJAYAN': 40, 'TUGU': 40, 'WATULIMO': 40, 'SANANWETAN': 40, 'SANAN WETAN': 40, 'KRAS': 40, 'WONODADI': 40, 'BAKUNG': 40, 'KADEMANGAN': 40, 'SURUH': 40, 'GANDUSARI': 40, 'DURENAN': 40, 'UDANAWU': 40, 'POGALAN': 40, 'TRENGGALEK': 40, 'NGLEGOK': 40, 'RINGINREJO': 40, 'MOJO': 40, 'SANANKULON': 40, 'BENDUNGAN': 40, 'KEDIRI KOTA': 40, 'KARANGAN': 40, 'PAGU': 40, 'KANDAT': 40, 'SUKOREJO': 40, 'KOTA': 40, 'GAMPENGREJO': 40,

  // Local Tulungagung (Fallback if not in specific kantor matrix)
  'SUMBERGEMPOL': 8, 'SUMEBRGEMPOL': 8, 'SUMBRGEMPOL': 8, 'SUMBERGEPOL': 8, 'GONDANG': 10, 'TANGGUNGGUNUNG': 25, 'TANGUNGGUNUNG': 25, 'TANGGUNG GUNUNG': 25, 'PAGERWOJO': 25, 'PAGEREOJO': 25, 'BESUKI': 30, 'SENDANG': 25, 'CAMPUR DARAT': 15, 'CAMPUIRDARAT': 15, 'CAMPURARAT': 15, 'TULUNAGGUNG': 2, 'TULUNGGAUNG': 2, 'KARANG REJO': 15, 'KARNGREJO': 15, 'KARANREJO': 15, 'KEDUNGARU': 5, 'KEDUNMGWARU': 5, 'KALIDWIR': 20, 'RETOTANGAN': 18, 'DEMUK': 20, 'PUCANGLABAN': 30, 'NGENTRONG': 15, 'PAKEL': 22
};

export function estimateJarakKantor(kantorString: string | null, kecamatanNasabah: string | null): number {
  if (!kantorString || !kecamatanNasabah) return 15;
  
  let kantor = kantorString.trim().toUpperCase();
  
  // Convert "01 - 06" to "KAUMAN"
  if (kantor.includes('-')) {
    const code = kantor.split('-').pop()?.trim() || '';
    if (SUBKANTOR_CODES[code]) {
      kantor = SUBKANTOR_CODES[code];
    }
  } else if (SUBKANTOR_CODES[kantor]) {
    kantor = SUBKANTOR_CODES[kantor];
  }

  const kec = kecamatanNasabah.trim().toUpperCase();

  let matchedKantorKey: string | null = null;
  for (const k of Object.keys(DISTANCE_MATRIX)) {
    if (kantor.includes(k) || k.includes(kantor)) {
      matchedKantorKey = k;
      break;
    }
  }

  let dist = 15; // default
  
  if (matchedKantorKey) {
    const distanceMap = DISTANCE_MATRIX[matchedKantorKey];
    for (const [namaKec, d] of Object.entries(distanceMap)) {
      if (kec.includes(namaKec)) {
        return d;
      }
    }
  }

  // Jika tidak ketemu di matriks kantor spesifik, cari di kamus jarak umum
  for (const [namaKec, d] of Object.entries(DISTANCE_TO_TULUNGAGUNG)) {
    if (kec.includes(namaKec)) {
      return d;
    }
  }

  return dist;
}
`;

code = code.replace(/export function estimateJarakKantor[\s\S]*?return 15; \/\/ default 15 KM\n\}/m, replacement);
fs.writeFileSync('lib/mappingUtils.ts', code);
console.log('Fixed mappingUtils.ts');
