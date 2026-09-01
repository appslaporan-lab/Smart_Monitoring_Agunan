const fs = require('fs');
let code = fs.readFileSync('app/performa/kolektibilitas/page.tsx', 'utf8');

const importAdd = `import { getKantorGroup, canAccessKantorData } from '@/lib/kantor';`;
if (code.includes(`import { getKantorGroup } from '@/lib/kantor';`)) {
  code = code.replace(`import { getKantorGroup } from '@/lib/kantor';`, importAdd);
}

const findOld = `const rows = await prisma.pinjamanPeriode.findMany({
    where: { periodeId: periodeAktif.id },
    orderBy: { id: 'asc' },
  });`;

const findNew = `let rows = await prisma.pinjamanPeriode.findMany({
    where: { periodeId: periodeAktif.id },
    orderBy: { id: 'asc' },
  });

  rows = rows.filter(r => canAccessKantorData(user.role, user.kantor, user.subKantor, r.subKantor));`;

if (code.includes(findOld)) {
  code = code.replace(findOld, findNew);
  fs.writeFileSync('app/performa/kolektibilitas/page.tsx', code);
  console.log('Fixed performa kolektibilitas data filtering');
} else {
  console.log('Target string not found in performa/kolektibilitas/page.tsx');
}
