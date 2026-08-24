const fs = require('fs');

let moCode = fs.readFileSync('app/api/kpi/mo-realisasi/route.ts', 'utf8');
if (!moCode.includes('logActivity')) {
  moCode = moCode.replace("import { getCurrentUser } from '@/lib/session';", "import { getCurrentUser } from '@/lib/session';\nimport { logActivity } from '@/lib/audit';");
  
  // Create MO Realisasi
  const oldCreate = `const realisasi = await prisma.realisasiHarianMO.create({
      data: {
        userId: targetUser,
        subKantor: userRecord?.subKantor || '',
        tanggal: new Date(tanggal),
        jenis,
        nominalAsli,
        saldoAkhir,
        nominal: nominalNet,
        keterangan: keterangan || null,
      },
    });`;
    
  const newCreate = `const realisasi = await prisma.realisasiHarianMO.create({
      data: {
        userId: targetUser,
        subKantor: userRecord?.subKantor || '',
        tanggal: new Date(tanggal),
        jenis,
        nominalAsli,
        saldoAkhir,
        nominal: nominalNet,
        keterangan: keterangan || null,
      },
    });
    
    await logActivity({
      userId: currentUser.id,
      username: currentUser.username,
      role: currentUser.role,
      action: 'INPUT_KPI_MO',
      entity: 'RealisasiHarianMO',
      entityId: realisasi.id.toString(),
      details: \`Input Rp \${nominalNet} untuk user \${targetUser}\`
    });`;

  moCode = moCode.replace(oldCreate, newCreate);
  
  // Delete MO Realisasi
  const oldDelete = `await prisma.realisasiHarianMO.delete({
      where: { id },
    });`;
    
  const newDelete = `const deleted = await prisma.realisasiHarianMO.delete({
      where: { id },
    });
    
    await logActivity({
      userId: currentUser.id,
      username: currentUser.username,
      role: currentUser.role,
      action: 'DELETE_KPI_MO',
      entity: 'RealisasiHarianMO',
      entityId: id.toString(),
      details: \`Dihapus superadmin. User target ID: \${deleted.userId}, Nominal: Rp \${deleted.nominal}\`
    });`;
    
  moCode = moCode.replace(oldDelete, newDelete);
  
  // Edit MO Realisasi
  const oldEdit = `await prisma.realisasiHarianMO.update({
      where: { id },
      data: { nominal: nominalNum },
    });`;
    
  const newEdit = `await prisma.realisasiHarianMO.update({
      where: { id },
      data: { nominal: nominalNum },
    });
    
    await logActivity({
      userId: currentUser.id,
      username: currentUser.username,
      role: currentUser.role,
      action: 'EDIT_KPI_MO',
      entity: 'RealisasiHarianMO',
      entityId: id.toString(),
      details: \`Diedit superadmin. Nominal baru: Rp \${nominalNum}\`
    });`;

  moCode = moCode.replace(oldEdit, newEdit);
  fs.writeFileSync('app/api/kpi/mo-realisasi/route.ts', moCode);
}
console.log('Audit hooked to MO');
