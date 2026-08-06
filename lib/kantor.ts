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

const normalizeSubKantor = (subKantor: string | null | undefined) => {
  if (!subKantor) return null;
  return subKantor.trim().padStart(2, '0');
};

export function getKantorGroup(subKantor: string | null | undefined): string | null {
  const kode = normalizeSubKantor(subKantor);
  if (!kode) return null;

  for (const [group, codes] of Object.entries(KANTOR_GROUPS)) {
    if (codes.includes(kode)) return group;
  }
  return null;
}

export function getKantorLabel(subKantor: string | null | undefined): string {
  const group = getKantorGroup(subKantor);
  return group ? KANTOR_LABEL[group] : 'Tidak Diketahui';
}

export function getKantorGroupFromName(kantor: string | null | undefined): string | null {
  if (!kantor) return null;

  const normalized = kantor.toUpperCase();
  if (normalized === 'PUSAT_1' || normalized === 'PUSAT1') return 'PUSAT_1';
  if (normalized === 'PUSAT_2' || normalized === 'PUSAT2') return 'PUSAT_2';
  if (normalized === 'CABANG') return 'CABANG';
  return null;
}

export const ROLE_KANTOR_ACCESS: Record<string, string[]> = {
  PUSAT_1: ['KASUBAG_KREDIT_PUSAT_1', 'KABAG_MARKETING_PUSAT_1', 'DIREKTUR', 'SUPERADMIN'],
  PUSAT_2: ['KASUBAG_KREDIT_PUSAT_2', 'KABAG_MARKETING_PUSAT_2', 'DIREKTUR', 'SUPERADMIN'],
  CABANG: ['KASUBAG_KREDIT_CABANG', 'PIMPINAN_CABANG', 'DIREKTUR', 'SUPERADMIN'],
};

export function canAccessKantorGroup(role: string, group: string | null): boolean {
  const normalizedRole = role?.toUpperCase();
  if (normalizedRole === 'DIREKTUR' || normalizedRole === 'SUPERADMIN' || normalizedRole === 'KABAG_OPERASIONAL' || normalizedRole === 'PETUGAS_COLLECTING') return true;
  if (normalizedRole === 'KEPALA_CABANG' || normalizedRole === 'PIMPINAN_CABANG') return group === 'CABANG';
  if (!group) return false;
  return ROLE_KANTOR_ACCESS[group]?.includes(normalizedRole) ?? false;
}

export function canAccessKantorData(
  role: string,
  userKantor: string | null | undefined,
  userSubKantor: string | null | undefined,
  itemSubKantor: string | null | undefined,
): boolean {
  const normalizedRole = role?.toUpperCase();

  if (normalizedRole === 'DIREKTUR' || normalizedRole === 'SUPERADMIN' || normalizedRole === 'KABAG_OPERASIONAL' || normalizedRole === 'PETUGAS_COLLECTING') return true;
  if (normalizedRole === 'KEPALA_CABANG' || normalizedRole === 'PIMPINAN_CABANG') {
    return getKantorGroup(itemSubKantor) === 'CABANG';
  }

  if (normalizedRole === 'TELLER' || normalizedRole === 'MO') {
    const normalizedUserSub = normalizeSubKantor(userSubKantor);
    const normalizedItemSub = normalizeSubKantor(itemSubKantor);

    if (!normalizedUserSub || !normalizedItemSub) return false;
    return normalizedUserSub === normalizedItemSub;
  }

  if (normalizedRole === 'KASUBAG_KREDIT_PUSAT_1' || normalizedRole === 'KABAG_MARKETING_PUSAT_1') {
    return getKantorGroup(itemSubKantor) === 'PUSAT_1';
  }

  if (normalizedRole === 'KASUBAG_KREDIT_PUSAT_2' || normalizedRole === 'KABAG_MARKETING_PUSAT_2') {
    return getKantorGroup(itemSubKantor) === 'PUSAT_2';
  }

  if (normalizedRole === 'KASUBAG_KREDIT_CABANG' || normalizedRole === 'KABAG_MARKETING_CABANG') {
    return getKantorGroup(itemSubKantor) === 'CABANG';
  }

  return canAccessKantorGroup(role, getKantorGroupFromName(userKantor));
}