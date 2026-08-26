const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.pinjamanPeriode.findFirst({
    where: { norek: '0516007079' }
  });
  if (p) {
    console.log(p.rawDataJson);
  } else {
    console.log('Not found');
  }
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
