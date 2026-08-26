const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.realisasiHarianMO.updateMany({
    where: { jenis: 'BARU' },
    data: { jenis: 'NASABAH_BARU' }
  });
  console.log('Migrated', result.count, 'records');
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
