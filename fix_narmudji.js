const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.pinjamanPeriode.findFirst({
    where: { norek: '1311008383' },
    orderBy: { id: 'desc' }
  });
  if (p) {
    await prisma.pinjamanPeriode.update({
      where: { id: p.id },
      data: { sudahBayar: true, nominalBayarHariIni: 500000 }
    });
    console.log('Fixed for Narmudji', p.id);
  } else {
    console.log('Norek not found');
  }
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
