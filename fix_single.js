const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.pinjamanPeriode.updateMany({
    where: { norek: '0516007079', periodeId: 7 },
    data: {
      tunggakanBunga: 5800000,
      angsuranPerBulan: 0,
      tglJatuhTempo: new Date(2017, 5, 19)
    }
  });
  console.log('Fixed for 0516007079');
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
