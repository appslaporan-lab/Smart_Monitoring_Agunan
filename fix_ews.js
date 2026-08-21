const fs = require('fs');

let ewsCode = fs.readFileSync('lib/ews.ts', 'utf8');
ewsCode = `import { differenceInDays, getDate, setDate, isBefore, addMonths } from 'date-fns';

export type EWSResult = {
  status: string;
  label: string;
  colorClass: string;
  hariTunggakan: number;
  wajibKunjungan: boolean;
};

export function determineEWS(hariTunggakan: number, tglJatuhTempo: Date | null, tglRealisasi?: Date | null, tglJanjiBayar?: Date | null): EWSResult {
  const today = new Date();
  
  if (tglJanjiBayar) {
    const hariMenujuJanji = differenceInDays(new Date(tglJanjiBayar), today);
    if (hariMenujuJanji <= 3 && hariMenujuJanji >= 0) {
      return { status: 'JANJI_BAYAR_DEKAT', label: \`H-\${hariMenujuJanji}: Ingatkan Janji Bayar\`, colorClass: 'status-warning', hariTunggakan, wajibKunjungan: false };
    }
  }

  if (tglRealisasi && hariTunggakan <= 0) {
    const billingDay = getDate(new Date(tglRealisasi));
    let nextBillingDate = setDate(today, billingDay);
    if (isBefore(nextBillingDate, today)) {
       nextBillingDate = addMonths(nextBillingDate, 1);
    }
    const hariMenujuTagihan = differenceInDays(nextBillingDate, today);
    
    if (hariMenujuTagihan <= 7 && hariMenujuTagihan >= 0) {
      return { status: 'H7_DESK_CALL', label: 'H-7: Harus Desk Call', colorClass: 'status-warning', hariTunggakan, wajibKunjungan: false };
    }
  }

  // Aman: belum atau baru 0-3 hari tunggakan
  if (hariTunggakan <= 3) {
    return { status: 'AMAN', label: 'Aman', colorClass: 'status-pending', hariTunggakan, wajibKunjungan: false };
  }
  // Hari ke 4-29: Kunjungan MO
  if (hariTunggakan < 30) {
    return { status: 'KUNJUNGAN_MO', label: 'Kunjungan MO', colorClass: 'status-warning', hariTunggakan, wajibKunjungan: true };
  }
  // Hari ke 30-59: Surat Tagihan 1
  if (hariTunggakan < 60) {
    return { status: 'SURAT_TAGIHAN_1', label: 'Terbitkan Surat Tagihan 1', colorClass: 'status-dikeluarkan', hariTunggakan, wajibKunjungan: true };
  }
  // Hari ke 60-89: Surat Tagihan 2
  if (hariTunggakan < 90) {
    return { status: 'SURAT_TAGIHAN_2', label: 'Terbitkan Surat Tagihan 2', colorClass: 'status-dikeluarkan', hariTunggakan, wajibKunjungan: true };
  }
  // Hari ke 90-119: Surat Tagihan 3
  if (hariTunggakan < 120) {
    return { status: 'SURAT_TAGIHAN_3', label: 'Terbitkan Surat Tagihan 3', colorClass: 'status-dikeluarkan', hariTunggakan, wajibKunjungan: true };
  }
  // Hari ke 120-149: SP 1
  if (hariTunggakan < 150) {
    return { status: 'SP_1', label: 'Terbitkan SP 1', colorClass: 'status-kembali', hariTunggakan, wajibKunjungan: true };
  }
  // Hari ke 150-180: SP 2
  if (hariTunggakan <= 180) {
    return { status: 'SP_2', label: 'Terbitkan SP 2', colorClass: 'status-kembali', hariTunggakan, wajibKunjungan: true };
  }
  // Hari ke 181+: SP 3
  return { status: 'SP_3', label: 'Terbitkan SP 3', colorClass: 'status-kembali', hariTunggakan, wajibKunjungan: true };
}

export const EWS_LABEL_MAP: Record<string, string> = {
  AMAN: 'Aman',
  H7_DESK_CALL: 'H-7: Harus Desk Call',
  JANJI_BAYAR_DEKAT: 'Mendekati Janji Bayar',
  KUNJUNGAN_MO: 'Kunjungan MO',
  SURAT_TAGIHAN_1: 'Terbitkan Surat Tagihan 1',
  SURAT_TAGIHAN_2: 'Terbitkan Surat Tagihan 2',
  SURAT_TAGIHAN_3: 'Terbitkan Surat Tagihan 3',
  SP_1: 'Terbitkan SP 1',
  SP_2: 'Terbitkan SP 2',
  SP_3: 'Terbitkan SP 3',
};
`;
fs.writeFileSync('lib/ews.ts', ewsCode);

let pageCode = fs.readFileSync('app/collecting/page.tsx', 'utf8');
pageCode = pageCode.replace(
  "ews: determineEWS(dynamicHariTunggakan, p.tglJatuhTempo),",
  `ews: (() => {
        let tglJanji: Date | null = null;
        if (p.kunjunganPenagihan && p.kunjunganPenagihan.length > 0) {
          const janji = p.kunjunganPenagihan.filter((k: any) => k.hasil === 'JANJI_BAYAR' && k.tanggalJanjiBayar);
          if (janji.length > 0) {
            janji.sort((a: any, b: any) => new Date(b.tanggalKunjungan).getTime() - new Date(a.tanggalKunjungan).getTime());
            tglJanji = janji[0].tanggalJanjiBayar;
          }
        }
        return determineEWS(dynamicHariTunggakan, p.tglJatuhTempo, p.tglRealisasi, tglJanji);
      })(),`
);
fs.writeFileSync('app/collecting/page.tsx', pageCode);

let listCode = fs.readFileSync('app/collecting/CollectingDebiturList.tsx', 'utf8');
listCode = listCode.replace(
  "const FILTER_OPTIONS: { key: string; label: string; match: (item: EwsItem) => boolean }[] = [",
  `const FILTER_OPTIONS: { key: string; label: string; match: (item: EwsItem) => boolean }[] = [
    { key: 'JANJI_BAYAR_DEKAT', label: 'Mendekati Janji Bayar', match: (i) => i.ews.status === 'JANJI_BAYAR_DEKAT' },`
);
fs.writeFileSync('app/collecting/CollectingDebiturList.tsx', listCode);
console.log('EWS patched');
