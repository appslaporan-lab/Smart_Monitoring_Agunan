const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.pinjamanPeriode.findFirst({
    where: { norek: '0216016892' },
    orderBy: { periodeId: 'desc' }
  });
  if (p) {
    console.log('ID:', p.id);
    console.log('rawDataJson:', p.rawDataJson);
    console.log('kdKolektibilitasLalu:', p.kdKolektibilitasLalu);
  } else {
    console.log('Not found');
  }
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
