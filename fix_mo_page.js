const fs = require('fs');
let code = fs.readFileSync('app/kpi/mo-realisasi/page.tsx', 'utf8');

if (!code.includes('SuperadminManageRealisasi')) {
  code = code.replace(
    "import Link from 'next/link';",
    "import Link from 'next/link';\nimport SuperadminManageRealisasi from '@/components/SuperadminManageRealisasi';"
  );
}

const roleFilterMO = `
  let whereMO: any = { tanggal: { gte: startDate, lte: endDate } };
  let whereTeller: any = { tanggal: { gte: startDate, lte: endDate }, kegiatan: 'Pencairan Pinjaman' };

  if (user.role === 'SUPERADMIN' || user.role === 'DIREKSI') {
    // see all
  } else if (user.role.includes('MARKETING') || user.role === 'AO') {
    whereMO.userId = user.id;
    whereTeller.user = { subKantor: user.subKantor || 'Pusat' };
  } else {
    // KEPALA KAS, KASUBAG KREDIT, dll see their branch
    whereMO.user = { subKantor: user.subKantor || 'Pusat' };
    whereTeller.user = { subKantor: user.subKantor || 'Pusat' };
  }

  // 1. Fetch MO Manual Inputs
  const moRecords = await prisma.realisasiHarianMO.findMany({
    where: whereMO,
`;

code = code.replace(
  "  // 1. Fetch MO Manual Inputs\n  const moRecords = await prisma.realisasiHarianMO.findMany({\n    where: { tanggal: { gte: startDate, lte: endDate } },",
  roleFilterMO
);

code = code.replace(
  "const tellerRecords = await prisma.performaKaryawan.findMany({\n    where: { \n      tanggal: { gte: startDate, lte: endDate },\n      kegiatan: 'Pencairan Pinjaman'\n    },",
  "const tellerRecords = await prisma.performaKaryawan.findMany({\n    where: whereTeller,"
);

code = code.replace(
  "</main>",
  "  {user.role === 'SUPERADMIN' && <SuperadminManageRealisasi records={moRecords as any} />}\n    </main>"
);

fs.writeFileSync('app/kpi/mo-realisasi/page.tsx', code);
console.log('Page updated');
