export const KANTOR_GROUPS: Record<string, string[]> = {
  PUSAT_1: ['01', '06', '07', '10', '14'],
  PUSAT_2: ['03', '05', '09', '12'],
  CABANG: ['02', '04', '08', '13', '15', '22'],
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
  if (!subKantor) return null;
  const str = subKantor.toUpperCase();

  // Keyword / kode mapping berdasarkan struktur BPR
  const mapping: Record<string, string[]> = {
    CABANG: ['02', '04', '08', '13', '15', '22', 'CAMPURDARAT', 'BANNDUNG', 'BANDUNG', 'BOYOLANGU', 'PAKEL', 'NGENTRONG'],
    PUSAT_2: ['03', '05', '09', '12', 'NGUNUT', 'KALIDAWIR', 'REJOTANGAN', 'PUCANGLABAN'],
    PUSAT_1: ['06', '07', '10', '14', '01', 'KAUMAN', 'NGANTRU', 'NGEMPLAK', 'KARANGREJO', 'PUSAT'],
  };

  // 1. Coba ekstrak 2 digit terakhir atau cari match persis
  const tokens = str.match(/\b\d{2}\b/g);
  if (tokens) {
    const lastCode = tokens[tokens.length - 1]; // e.g. "01 - 06" -> "06"
    for (const [group, keywords] of Object.entries(mapping)) {
      if (keywords.includes(lastCode)) return group;
    }
  }

  // 2. Fallback pencocokan teks
  for (const [group, keywords] of Object.entries(mapping)) {
    for (const kw of keywords) {
      if (str.includes(kw)) return group;
    }
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

// Role yang boleh melihat data dari SEMUA kelompok kantor tanpa dibatasi
const FULL_ACCESS_ROLES = ['DIREKTUR', 'SUPERADMIN', 'KABAG_OPERASIONAL', 'KASUBAG_REMEDIAL'];

export function canAccessKantorGroup(role: string, group: string | null): boolean {
  const normalizedRole = role?.toUpperCase();
  if (FULL_ACCESS_ROLES.includes(normalizedRole)) return true;
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
  if (FULL_ACCESS_ROLES.includes(normalizedRole)) return true;
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