const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const activePeriode = await prisma.periodeNominatif.findFirst({
    where: { jenisUpload: 'COLLECTING' },
    orderBy: { id: 'desc' },
  });

  if (!activePeriode) {
    console.log('No active period');
    return;
  }

  const allPinjaman = await prisma.pinjamanPeriode.findMany({
    where: { periodeId: activePeriode.id },
    select: { norek: true }
  });
  
  const norekList = allPinjaman.map(p => p.norek);
  console.log('Total norek in active period:', norekList.length);
  
  const toCheck = ['1311008403', '1352000282', '1351000417', '1352000173', '1352000214', '1352000241', '1352000130', '1352000050', '1352000158', '1352000247'];
  
  for (const n of toCheck) {
    const found = norekList.includes(n);
    console.log("Norek " + n + ": " + (found ? "FOUND" : "MISSING"));
  }
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
