const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.pinjamanPeriode.findFirst({
    where: { 
      namaNasabahExcel: { contains: 'ZAYYINATUL' }
    }
  });
  if (p) {
    console.log('Found Zayyinatul! Norek:', p.norek, 'Nama:', p.namaNasabahExcel);
  } else {
    console.log('Zayyinatul NOT FOUND');
  }
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
