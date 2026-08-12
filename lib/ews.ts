import { differenceInDays } from 'date-fns';

export type EWSResult = {
  status: string;
  label: string;
  colorClass: string;
  hariTunggakan: number;
  wajibKunjungan: boolean;
};

export function determineEWS(hariTunggakan: number, tglJatuhTempo: Date | null): EWSResult {
  if (tglJatuhTempo) {
    const hariMenujuJatuhTempo = differenceInDays(new Date(tglJatuhTempo), new Date());
    if (hariMenujuJatuhTempo <= 7 && hariMenujuJatuhTempo >= 0 && hariTunggakan <= 0) {
      return { status: 'H7_DESK_CALL', label: 'H-7: Harus Desk Call', colorClass: 'status-warning', hariTunggakan, wajibKunjungan: false };
    }
  }

  // Aman: belum atau baru 0–3 hari tunggakan
  if (hariTunggakan <= 3) {
    return { status: 'AMAN', label: 'Aman', colorClass: 'status-pending', hariTunggakan, wajibKunjungan: false };
  }
  // Hari ke 4–29: Kunjungan MO
  if (hariTunggakan < 30) {
    return { status: 'KUNJUNGAN_MO', label: 'Kunjungan MO', colorClass: 'status-warning', hariTunggakan, wajibKunjungan: true };
  }
  // Hari ke 30–59: Surat Tagihan 1
  if (hariTunggakan < 60) {
    return { status: 'SURAT_TAGIHAN_1', label: 'Terbitkan Surat Tagihan 1', colorClass: 'status-dikeluarkan', hariTunggakan, wajibKunjungan: true };
  }
  // Hari ke 60–89: Surat Tagihan 2
  if (hariTunggakan < 90) {
    return { status: 'SURAT_TAGIHAN_2', label: 'Terbitkan Surat Tagihan 2', colorClass: 'status-dikeluarkan', hariTunggakan, wajibKunjungan: true };
  }
  // Hari ke 90–119: Surat Tagihan 3
  if (hariTunggakan < 120) {
    return { status: 'SURAT_TAGIHAN_3', label: 'Terbitkan Surat Tagihan 3', colorClass: 'status-dikeluarkan', hariTunggakan, wajibKunjungan: true };
  }
  // Hari ke 120–149: SP 1
  if (hariTunggakan < 150) {
    return { status: 'SP_1', label: 'Terbitkan SP 1', colorClass: 'status-kembali', hariTunggakan, wajibKunjungan: true };
  }
  // Hari ke 150–180: SP 2
  if (hariTunggakan <= 180) {
    return { status: 'SP_2', label: 'Terbitkan SP 2', colorClass: 'status-kembali', hariTunggakan, wajibKunjungan: true };
  }
  // Hari ke 181+: SP 3
  return { status: 'SP_3', label: 'Terbitkan SP 3', colorClass: 'status-kembali', hariTunggakan, wajibKunjungan: true };
}

export const EWS_LABEL_MAP: Record<string, string> = {
  AMAN: 'Aman',
  H7_DESK_CALL: 'H-7: Harus Desk Call',
  KUNJUNGAN_MO: 'Kunjungan MO',
  SURAT_TAGIHAN_1: 'Terbitkan Surat Tagihan 1',
  SURAT_TAGIHAN_2: 'Terbitkan Surat Tagihan 2',
  SURAT_TAGIHAN_3: 'Terbitkan Surat Tagihan 3',
  SP_1: 'Terbitkan SP 1',
  SP_2: 'Terbitkan SP 2',
  SP_3: 'Terbitkan SP 3',
};