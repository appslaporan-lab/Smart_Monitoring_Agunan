const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.pinjamanPeriode.updateMany({
    where: { norek: '0216016892' },
    data: { kdKolektibilitasLalu: '1' }
  });
  console.log('Fixed for Mahmud');
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
