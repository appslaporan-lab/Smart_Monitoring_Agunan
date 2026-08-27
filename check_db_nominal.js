const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.pinjamanPeriode.findFirst({
    where: { norek: '1311008403' },
    orderBy: { id: 'desc' }
  });
  console.log(p.sudahBayar, p.nominalBayarHariIni);
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
