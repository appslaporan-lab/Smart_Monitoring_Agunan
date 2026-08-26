const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pList = await prisma.periodeNominatif.findMany({
    orderBy: { id: 'desc' }
  });
  console.log(pList);
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
