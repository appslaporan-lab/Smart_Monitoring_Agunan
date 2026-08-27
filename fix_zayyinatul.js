const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.pinjamanPeriode.updateMany({
    where: { norek: '1352000180' },
    data: { sudahBayar: true, isLunas: true, nominalBayarHariIni: 10786783 }
  });
  console.log('Fixed for Zayyinatul');
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
