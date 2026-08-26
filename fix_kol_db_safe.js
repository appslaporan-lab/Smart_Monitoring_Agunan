const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pinjamans = await prisma.pinjamanPeriode.findMany({
    select: { id: true, rawDataJson: true },
    where: { rawDataJson: { not: null } }
  });

  let updated = 0;
  for (const p of pinjamans) {
    try {
      const row = JSON.parse(p.rawDataJson);
      let kolLalu = row['Q'] ? String(row['Q']).trim() : null;
      if (kolLalu) {
        await prisma.pinjamanPeriode.update({
          where: { id: p.id },
          data: { kdKolektibilitasLalu: kolLalu }
        });
        updated++;
      }
    } catch(e) {}
  }
  console.log('Updated Kol Lalu for', updated, 'records');
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
