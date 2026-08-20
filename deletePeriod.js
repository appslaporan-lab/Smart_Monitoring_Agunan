const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deletePeriod() {
  const periode = await prisma.periodeNominatif.findFirst({
    where: { bulan: 8, tahun: 2026, jenisUpload: 'COLLECTING' }
  });

  if (periode) {
    // Delete all child records first
    await prisma.kunjunganPenagihan.deleteMany({
      where: { pinjamanPeriode: { periodeId: periode.id } }
    });
    
    await prisma.pinjamanPeriode.deleteMany({
      where: { periodeId: periode.id }
    });

    await prisma.periodeNominatif.delete({
      where: { id: periode.id }
    });
    
    console.log(`Successfully deleted period 8/2026 (COLLECTING)`);
  } else {
    console.log(`Period 8/2026 (COLLECTING) not found.`);
  }
}

deletePeriod()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
