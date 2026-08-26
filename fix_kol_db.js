const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pinjamans = await prisma.pinjamanPeriode.findMany({
    select: { id: true, rawDataJson: true },
    where: { rawDataJson: { not: null } }
  });

  console.log('Total to fix Kol:', pinjamans.length);
  const batchSize = 100;
  let updated = 0;
  
  for (let i = 0; i < pinjamans.length; i += batchSize) {
    const batch = pinjamans.slice(i, i + batchSize);
    await Promise.all(batch.map(async p => {
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
    }));
    console.log('Processed', i + batch.length);
  }
  console.log('Updated Kol Lalu for', updated, 'records');
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
