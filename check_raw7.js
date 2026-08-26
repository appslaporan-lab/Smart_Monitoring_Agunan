const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.pinjamanPeriode.findFirst({
    where: { norek: '0516007079', periodeId: 7 }
  });
  console.log('ID 7 rawDataJson:', p.rawDataJson);
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
