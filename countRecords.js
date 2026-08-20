const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const periode = await prisma.periodeNominatif.findFirst({
    where: { jenisUpload: 'COLLECTING' },
    orderBy: [{ tahun: 'desc' }, { bulan: 'desc' }],
  });

  if (!periode) {
    console.log('No active period found');
    return;
  }

  const count = await prisma.pinjamanPeriode.count({
    where: { periodeId: periode.id },
  });

  console.log(`Active Period: ${periode.bulan}/${periode.tahun} (ID: ${periode.id})`);
  console.log(`totalBaris recorded: ${periode.totalBaris}`);
  console.log(`Total records in DB for this period: ${count}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
