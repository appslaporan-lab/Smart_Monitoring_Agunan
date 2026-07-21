import type { PengajuanJenis, UserRole, AgunanStatus } from '@prisma/client';

type StepDef = { rolesDiizinkan: string };

export function determineSteps(jenis: PengajuanJenis, submitterRole: UserRole): StepDef[] {
  switch (jenis) {
    case 'LUNAS_LANGSUNG':
      if (submitterRole === 'ADM_KREDIT_PUSAT') return [{ rolesDiizinkan: 'KABAG_OPERASIONAL,DIREKTUR' }];
      if (submitterRole === 'ADM_KREDIT_CABANG') return [{ rolesDiizinkan: 'PIMPINAN_CABANG,DIREKTUR' }];
      return [{ rolesDiizinkan: 'DIREKTUR' }];
    case 'LUNAS_TRANSFER_PUSAT_KE_CABANG':
      return [
        { rolesDiizinkan: 'PIMPINAN_CABANG' },
        { rolesDiizinkan: 'KABAG_OPERASIONAL' },
      ];
    case 'LUNAS_TRANSFER_CABANG_KE_CABANG':
      return [
        { rolesDiizinkan: 'PIMPINAN_CABANG' },
        { rolesDiizinkan: 'ADM_KREDIT_PUSAT' },
      ];
    case 'PENCAIRAN_ULANG':
      return [
        { rolesDiizinkan: 'ADM_KREDIT_PUSAT,ADM_KREDIT_CABANG' },
        { rolesDiizinkan: 'PIMPINAN_CABANG,KABAG_OPERASIONAL' },
      ];
    case 'HER_5_TAHUN':
      return [];
    default:
      return [{ rolesDiizinkan: 'DIREKTUR' }];
  }
}

export const ALLOWED_SUBMITTERS: Record<string, string[]> = {
  LUNAS_LANGSUNG: ['ADM_KREDIT_PUSAT', 'ADM_KREDIT_CABANG'],
  LUNAS_TRANSFER_PUSAT_KE_CABANG: ['ADM_KREDIT_PUSAT'],
  LUNAS_TRANSFER_CABANG_KE_CABANG: ['ADM_KREDIT_CABANG'],
  PENCAIRAN_ULANG: ['KEPALA_KAS'],
  HER_5_TAHUN: ['ADM_KREDIT_PUSAT', 'ADM_KREDIT_CABANG'],
};

export const FINAL_STATUS_MAP: Record<string, AgunanStatus> = {
  LUNAS_LANGSUNG: 'DISERAHKAN',
  LUNAS_TRANSFER_PUSAT_KE_CABANG: 'DISERAHKAN',
  LUNAS_TRANSFER_CABANG_KE_CABANG: 'DISERAHKAN',
  PENCAIRAN_ULANG: 'PENCAIRAN_ULANG',
};

export const JENIS_LABEL: Record<string, string> = {
  LUNAS_LANGSUNG: 'Lunas - Serah Langsung',
  LUNAS_TRANSFER_PUSAT_KE_CABANG: 'Lunas - Transfer (dari Pusat)',
  LUNAS_TRANSFER_CABANG_KE_CABANG: 'Lunas - Transfer (dari Cabang)',
  PENCAIRAN_ULANG: 'Pencairan Ulang',
  HER_5_TAHUN: 'HER 5 Tahunan',
};