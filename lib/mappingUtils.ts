export function mapProdukKredit(kdProduct: string): string | null {
  if (!kdProduct) return null;
  const p = kdProduct.trim();
  if (['11.11', '11.13', '12.11', '12.13', '13.11', '13.13', '16.11', '16.13'].includes(p)) return 'Kredit Reguler';
  if (['11.12', '12.12', '13.12', '16.12'].includes(p)) return 'Kredit Reguler Efektif';
  if (['11.22', '12.22', '13.22', '16.22'].includes(p)) return 'Kredit UKM Efektif';
  if (['11.21', '11.23', '12.21', '12.23', '13.21', '13.23', '16.21', '16.23'].includes(p)) return 'Kredit UKM';
  if (['14.1', '14.2', '14.3'].includes(p)) return 'Kredit Pegawai';
  if (['14.4', '15.1', '15.2', '15.3'].includes(p)) return 'Kredit Perangkat';
  if (['19', '19.2'].includes(p)) return 'Kredit Sindikasi';
  if (['21', '21.1'].includes(p)) return 'Kredit Haramain';
  if (['22', '22.1'].includes(p)) return 'Kredit BPD';
  if (['26', '26.1'].includes(p)) return 'Kredit Penghasilan Tetap';
  if (p === '28') return 'Kredit Tunas';
  if (p === '29') return 'Kredit PPPK PW';
  if (p === '30') return 'Kredit Senyum';
  return p; // fallback
}

export function mapSektorEkonomi(kdProduct: string): string | null {
  if (!kdProduct) return null;
  const p = kdProduct.trim();
  if (['11.11', '11.12', '11.13', '11.21', '11.22', '11.23'].includes(p)) return 'Dagang';
  if (['12.11', '12.12', '12.13', '12.21', '12.22', '12.23'].includes(p)) return 'Industri';
  if (['13.11', '13.12', '13.13', '13.21', '13.22', '13.23'].includes(p)) return 'Jasa';
  if (['16.11', '16.12', '16.13', '16.21', '16.22', '16.23'].includes(p)) return 'Pertanian';
  if (['14.1', '14.2', '14.3', '14.4', '15.1', '15.2', '15.3', '21', '21.1', '22', '22.1', '26', '26.1', '29'].includes(p)) return 'Multiguna';
  if (['19', '19.2'].includes(p)) return 'Sindikasi';
  if (['28', '30'].includes(p)) return 'Mikro';
  return null;
}

export function mapJenisJaminan(jenis: string): string {
  if (!jenis) return 'Lainnya';
  const j = jenis.trim().toUpperCase();
  if (j === 'AN020203') return 'BPKB';
  if (['AN020101', 'AN02010301', 'AN02010203'].includes(j)) return 'SHM/AJB';
  if (j === 'F04150204') return 'SK';
  if (j === 'F11') return 'Deposito';
  if (j === 'F2001') return 'Emas';
  return 'Lainnya';
}

const DISTANCE_MATRIX: Record<string, Record<string, number>> = {
  PUSAT: { KEDUNGWARU: 0, CAMPURDARAT: 15, NGUNUT: 12, BANDUNG: 25, KALIDAWIR: 20, KAUMAN: 8, NGANTRU: 10, BOYOLANGU: 7, REJOTANGAN: 18, TULUNGAGUNG: 2, PUCANGLABAN: 30, PAKEL: 22, KARANGREJO: 15 },
  'KAS CAMPURDARAT': { CAMPURDARAT: 0, BANDUNG: 10, PAKEL: 8, BOYOLANGU: 12 },
  'KAS NGUNUT': { NGUNUT: 0, REJOTANGAN: 8, KALIDAWIR: 10 },
  'KAS BANDUNG': { BANDUNG: 0, CAMPURDARAT: 10, PAKEL: 5 },
  'KAS KALIDAWIR': { KALIDAWIR: 0, NGUNUT: 10, PUCANGLABAN: 15 },
  'KAS KAUMAN': { KAUMAN: 0, KARANGREJO: 5, KEDUNGWARU: 8 },
  'KAS NGANTRU': { NGANTRU: 0, KEDUNGWARU: 10, KARANGREJO: 8 },
  'KAS BOYOLANGU': { BOYOLANGU: 0, CAMPURDARAT: 12, TULUNGAGUNG: 5 },
  'KAS REJOTANGAN': { REJOTANGAN: 0, NGUNUT: 8 },
  'KAS NGEMPLAK': { TULUNGAGUNG: 0, KEDUNGWARU: 2, BOYOLANGU: 5 },
  'KAS PUCANGLABAN': { PUCANGLABAN: 0, KALIDAWIR: 15 },
  'KAS PAKEL': { PAKEL: 0, BANDUNG: 5, CAMPURDARAT: 8 },
  'KAS KARANGREJO': { KARANGREJO: 0, KAUMAN: 5, NGANTRU: 8 },
  'KAS NGENTRONG': { CAMPURDARAT: 2, BANDUNG: 12, PAKEL: 10 },
};

const SUBKANTOR_CODES: Record<string, string> = {
  '01': 'PUSAT', '06': 'KAUMAN', '07': 'NGANTRU', '10': 'NGEMPLAK', '14': 'KARANGREJO',
  '03': 'NGUNUT', '05': 'KALIDAWIR', '09': 'REJOTANGAN', '12': 'PUCANGLABAN',
  '02': 'CAMPURDARAT', '04': 'BANDUNG', '08': 'BOYOLANGU', '13': 'PAKEL', '15': 'NGENTRONG'
};


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

