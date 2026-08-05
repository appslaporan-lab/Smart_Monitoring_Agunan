export const KANTOR_GROUPS: Record<string, string[]> = {
  PUSAT_1: ['01', '06', '07', '10', '14'],
  PUSAT_2: ['03', '05', '09', '12'],
  CABANG: ['02', '04', '08', '13', '15'],
};

export const KANTOR_LABEL: Record<string, string> = {
  PUSAT_1: 'Pusat 1',
  PUSAT_2: 'Pusat 2',
  CABANG: 'Cabang',
};

export function getKantorGroup(subKantor: string | null | undefined): string | null {
  if (!subKantor) return null;
  const kode = subKantor.trim().padStart(2, '0');
  for (const [group, codes] of Object.entries(KANTOR_GROUPS)) {
    if (codes.includes(kode)) return group;
  }
  return null;
}

export function getKantorLabel(subKantor: string | null | undefined): string {
  const group = getKantorGroup(subKantor);
  return group ? KANTOR_LABEL[group] : 'Tidak Diketahui';
}

export const ROLE_KANTOR_ACCESS: Record<string, string[]> = {
  PUSAT_1: ['KASUBAG_KREDIT_PUSAT_1', 'KABAG_MARKETING_PUSAT_1', 'DIREKTUR', 'SUPERADMIN'],
  PUSAT_2: ['KASUBAG_KREDIT_PUSAT_2', 'KABAG_MARKETING_PUSAT_2', 'DIREKTUR', 'SUPERADMIN'],
  CABANG: ['KASUBAG_KREDIT_CABANG', 'PIMPINAN_CABANG', 'DIREKTUR', 'SUPERADMIN'],
};

export function canAccessKantorGroup(role: string, group: string | null): boolean {
  if (role === 'DIREKTUR' || role === 'SUPERADMIN') return true;
  if (!group) return false;
  return ROLE_KANTOR_ACCESS[group]?.includes(role) ?? false;
}